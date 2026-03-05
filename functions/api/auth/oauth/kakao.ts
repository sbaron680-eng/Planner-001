import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../../_types';
import { createOAuthState } from './_helper';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.KAKAO_CLIENT_ID) {
    return new Response('카카오 OAuth가 설정되지 않았습니다.', { status: 503 });
  }

  const url = new URL(request.url);
  const redirectAfter = url.searchParams.get('next') ?? '/dashboard';
  const state = await createOAuthState(env, 'kakao', redirectAfter);
  const redirectUri = `${env.APP_URL}/api/auth/oauth/callback/kakao`;

  const authUrl = new URL('https://kauth.kakao.com/oauth/authorize');
  authUrl.searchParams.set('client_id', env.KAKAO_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);
  // 동의 항목: 닉네임, 이메일, 프로필 이미지
  authUrl.searchParams.set('scope', 'profile_nickname profile_image account_email');

  return Response.redirect(authUrl.toString(), 302);
};
