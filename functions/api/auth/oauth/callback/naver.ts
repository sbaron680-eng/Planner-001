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

  if (oauthError) return redirectErrorToFrontend(appUrl, `네이버 로그인 취소: ${oauthError}`);
  if (!code || !state) return redirectErrorToFrontend(appUrl, '잘못된 요청입니다.');

  const stateData = await verifyOAuthState(env, state);
  if (!stateData || stateData.provider !== 'naver') {
    return redirectErrorToFrontend(appUrl, '보안 검증 실패. 다시 시도해주세요.');
  }

  try {
    const redirectUri = `${env.APP_URL}/api/auth/oauth/callback/naver`;

    // 코드 → 액세스 토큰
    const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.NAVER_CLIENT_ID,
        client_secret: env.NAVER_CLIENT_SECRET,
        code,
        state,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      return redirectErrorToFrontend(appUrl, '네이버 인증 실패. 다시 시도해주세요.');
    }

    const tokenData = await tokenRes.json() as { access_token: string };

    // 사용자 정보 조회
    const userRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userRes.json() as {
      resultcode: string;
      response?: {
        id: string; email?: string; name?: string; nickname?: string;
        profile_image?: string;
      };
    };

    if (userInfo.resultcode !== '00' || !userInfo.response) {
      return redirectErrorToFrontend(appUrl, '네이버 사용자 정보를 가져올 수 없습니다.');
    }

    const r = userInfo.response;
    const { userId, role } = await createOrFindOAuthUser(env, {
      provider: 'naver',
      provider_id: r.id,
      email: r.email,
      name: r.name ?? r.nickname ?? '네이버 사용자',
      avatar_url: r.profile_image,
    });

    const token = await issueSession(env, userId, role);
    return redirectToFrontend(appUrl, token, stateData.redirectAfter);
  } catch (err) {
    console.error('Naver OAuth error:', err);
    return redirectErrorToFrontend(appUrl, '로그인 처리 중 오류가 발생했습니다.');
  }
};
