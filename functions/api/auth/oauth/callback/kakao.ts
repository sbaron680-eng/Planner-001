import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../../../_types';
import {
  verifyOAuthState, createOrFindOAuthUser, issueSession,
  redirectToFrontend, redirectErrorToFrontend,
} from '../_helper';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const appUrl = env.APP_URL ?? '';
  const url = new URL(request.url);
  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) return redirectErrorToFrontend(appUrl, `카카오 로그인 취소: ${oauthError}`);
  if (!code || !state) return redirectErrorToFrontend(appUrl, '잘못된 요청입니다.');

  const stateData = await verifyOAuthState(env, state);
  if (!stateData || stateData.provider !== 'kakao') {
    return redirectErrorToFrontend(appUrl, '보안 검증 실패. 다시 시도해주세요.');
  }

  try {
    const redirectUri = `${appUrl}/api/auth/oauth/callback/kakao`;

    // 코드 → 액세스 토큰
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.KAKAO_CLIENT_ID,
        client_secret: env.KAKAO_CLIENT_SECRET ?? '',
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenRes.ok) {
      return redirectErrorToFrontend(appUrl, '카카오 인증 실패. 다시 시도해주세요.');
    }

    const tokenData = await tokenRes.json() as { access_token: string };

    // 사용자 정보 조회
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userRes.json() as {
      id: number;
      kakao_account?: {
        email?: string;
        email_needs_agreement?: boolean;
        profile?: { nickname?: string; profile_image_url?: string };
      };
    };

    const profile = userInfo.kakao_account?.profile;
    const { userId, role } = await createOrFindOAuthUser(env, {
      provider: 'kakao',
      provider_id: String(userInfo.id),
      email: userInfo.kakao_account?.email_needs_agreement
        ? undefined
        : userInfo.kakao_account?.email,
      name: profile?.nickname ?? '카카오 사용자',
      avatar_url: profile?.profile_image_url,
    });

    const token = await issueSession(env, userId, role);
    return redirectToFrontend(appUrl, token, stateData.redirectAfter);
  } catch (err) {
    console.error('Kakao OAuth error:', err);
    return redirectErrorToFrontend(appUrl, '로그인 처리 중 오류가 발생했습니다.');
  }
};
