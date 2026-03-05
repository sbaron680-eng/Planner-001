import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../../_types';
import { createOAuthState } from './_helper';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.NAVER_CLIENT_ID) {
    return new Response('네이버 OAuth가 설정되지 않았습니다.', { status: 503 });
  }

  const url = new URL(request.url);
  const redirectAfter = url.searchParams.get('next') ?? '/dashboard';
  const state = await createOAuthState(env, 'naver', redirectAfter);
  const redirectUri = `${env.APP_URL}/api/auth/oauth/callback/naver`;

  const authUrl = new URL('https://nid.naver.com/oauth2.0/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', env.NAVER_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);

  return Response.redirect(authUrl.toString(), 302);
};
