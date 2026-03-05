import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../../_types';
import { createOAuthState } from './_helper';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = 'openid email profile';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.GOOGLE_CLIENT_ID) {
    return new Response('Google OAuth가 설정되지 않았습니다.', { status: 503 });
  }

  const url = new URL(request.url);
  const redirectAfter = url.searchParams.get('next') ?? '/dashboard';
  const state = await createOAuthState(env, 'google', redirectAfter);
  const redirectUri = `${env.APP_URL}/api/auth/oauth/callback/google`;

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'online');
  authUrl.searchParams.set('prompt', 'select_account');

  return Response.redirect(authUrl.toString(), 302);
};
