import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { env } from '$env/dynamic/public';

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	event.locals.supabase = createServerClient(
		env.PUBLIC_SUPABASE_URL,
		env.PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				/**
				 * SvelteKit's cookies API requires `path` to be explicitly set in
				 * the cookie options. Setting `path` to `/` replicates previous/
				 * standard behavior.
				 */
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	/**
	 * Enhanced safeGetSession function with better error handling and
	 * validation caching to prevent excessive auth calls.
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also validates the JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		// First, check if we have a session
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		// Check session expiration time
		const now = Math.floor(Date.now() / 1000); // Current time in seconds

		// Add a 5-minute buffer to avoid edge cases with clock skew
		if (session.expires_at && session.expires_at < now - 300) {
			// Session is clearly expired, no need to make an API call
			return { session: null, user: null };
		}

		// If the session is very close to expiry, don't validate it server-side
		// Let the client handle the refresh to avoid race conditions
		if (session.expires_at && session.expires_at - now < 60) {
			// Return existing session without validation if it expires in less than a minute
			// This prevents excessive validation requests during token refresh periods
			return { session, user: session.user };
		}

		try {
			// Only validate the session if it's not close to expiry
			const {
				data: { user },
				error
			} = await event.locals.supabase.auth.getUser();

			if (error) {
				// JWT validation has failed - clear the invalid cookies
				if (error.status === 400 && error.message.includes('JWT')) {
					// Clear auth cookies to prevent continued errors
					event.cookies.delete('sb-access-token', { path: '/' });
					event.cookies.delete('sb-refresh-token', { path: '/' });
				}

				console.error('Auth error in safeGetSession:', error.message);
				return { session: null, user: null };
			}

			return { session, user };
		} catch (err) {
			console.error('Unexpected error in safeGetSession:', err);
			return { session: null, user: null };
		}
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!event.locals.session && event.url.pathname.startsWith('/portal')) {
		redirect(303, '/auth/login');
	}

	if (event.locals.session && event.url.pathname.startsWith('/auth')) {
		if (event.url.pathname !== '/auth/logout') {
			redirect(303, '/portal');
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
