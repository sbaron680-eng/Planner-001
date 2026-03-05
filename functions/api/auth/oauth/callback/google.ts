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

  if (oauthError) return redirectErrorToFrontend(appUrl, `Google 로그인 취소: ${oauthError}`);
  if (!code || !state) return redirectErrorToFrontend(appUrl, '잘못된 요청입니다.');

  const stateData = await verifyOAuthState(env, state);
  if (!stateData || stateData.provider !== 'google') {
    return redirectErrorToFrontend(appUrl, '보안 검증 실패. 다시 시도해주세요.');
  }

  try {
    const redirectUri = `${appUrl}/api/auth/oauth/callback/google`;

    // 코드 → 액세스 토큰 교환
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Google token exchange failed:', err);
      return redirectErrorToFrontend(appUrl, 'Google 인증 실패. 다시 시도해주세요.');
    }

    const tokenData = await tokenRes.json() as { access_token: string; id_token?: string };

    // 사용자 정보 조회
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userRes.json() as {
      sub: string; email?: string; name?: string; picture?: string; email_verified?: boolean;
    };

    const { userId, role } = await createOrFindOAuthUser(env, {
      provider: 'google',
      provider_id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name ?? userInfo.email ?? 'Google 사용자',
      avatar_url: userInfo.picture,
    });

    const token = await issueSession(env, userId, role);
    return redirectToFrontend(appUrl, token, stateData.redirectAfter);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return redirectErrorToFrontend(appUrl, '로그인 처리 중 오류가 발생했습니다.');
  }
};
