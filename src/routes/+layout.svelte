<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { onNavigate } from '$app/navigation';
	import { navigating } from '$app/state';
	import { fade } from 'svelte/transition';

	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import Dock from '$lib/components/Dock.svelte';
	import DockIcon from '$lib/components/DockIcon.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Home, LogOut, Pencil, User, UserRound, LoaderCircle } from '@lucide/svelte';

	let { data, children } = $props();
	let { session, supabase, url } = $derived(data);
	let userXp = $state(0);
	let isSessionValid = $state(true);
	let refreshInProgress = $state(false);
	let lastRefreshAttempt = $state(0);
	
	// Minimum time between refresh attempts (5 seconds)
	const REFRESH_COOLDOWN = 5000;

	// Function to handle session expiration
	function handleSessionExpiration() {
		if (isSessionValid) {
			console.log('Session expired, redirecting to logout');
			isSessionValid = false;
			// Redirect to logout after a brief delay
			setTimeout(() => goto('/auth/logout'), 100);
		}
	}

	// Function to safely fetch user data
	async function safelyFetchUserData() {
		if (!session?.user || !isSessionValid) return null;
		
		try {
			const { data: userData, error } = await supabase
				.from('users')
				.select('xp')
				.eq('id', session.user.id)
				.single();

			if (error) {
				if (error.code === '402' || error.code === '429' || error.message?.includes('JWT')) {
					handleSessionExpiration();
					return null;
				}
				console.error('Error fetching user data:', error);
				return null;
			}

			return userData;
		} catch (err) {
			console.error('Error in fetchUserData:', err);
			return null;
		}
	}

	// Throttled token refresh function
	async function throttledRefreshToken() {
		const now = Date.now();
		
		// Don't allow refreshes if one is in progress or if we've tried recently
		if (refreshInProgress || (now - lastRefreshAttempt < REFRESH_COOLDOWN)) {
			return false;
		}
		
		refreshInProgress = true;
		lastRefreshAttempt = now;
		
		try {
			const { data, error } = await supabase.auth.refreshSession();
			
			if (error) {
				console.error('Error refreshing token:', error);
				handleSessionExpiration();
				return false;
			}
			
			if (data.session) {
				isSessionValid = true;
				return true;
			}
			
			return false;
		} catch (err) {
			console.error('Error in refreshToken:', err);
			return false;
		} finally {
			refreshInProgress = false;
		}
	}

	// Fetch user XP if logged in
	$effect(() => {
		async function fetchUserXp() {
			if (!session?.user || !isSessionValid) return;
			
			const userData = await safelyFetchUserData();
			if (userData) {
				userXp = userData.xp || 0;
			}
		}

		fetchUserXp();
	});

	// Listen for XP updates and auth state changes
	onMount(() => {
		// Attempt immediate token refresh if session is close to expiry
		if (session) {
			const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;  // convert to ms
			const now = Date.now();
			const timeToExpiry = expiresAt - now;
			
			// If token expires in less than 5 minutes, refresh it
			if (timeToExpiry < 300000 && timeToExpiry > 0) {
				throttledRefreshToken();
			} else if (timeToExpiry <= 0) {
				handleSessionExpiration();
			}
		}
		
		// Event listener for auth state changes
		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (event === 'SIGNED_OUT') {
				isSessionValid = false;
				userXp = 0;
			} else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
				isSessionValid = true;
				// Update session expiry info
				if (newSession?.expires_at !== session?.expires_at) {
					invalidate('supabase:auth');
				}
			}
		});

		// Event listener for XP updates
		const handleXpUpdate = async (event: Event) => {
			if (!session?.user || !isSessionValid) return;
			
			const userData = await safelyFetchUserData();
			if (userData) {
				userXp = userData.xp || 0;
			}
		};

		// Add event listener
		window.addEventListener('xp-updated', handleXpUpdate);

		// Return cleanup function
		return () => {
			data.subscription.unsubscribe();
			window.removeEventListener('xp-updated', handleXpUpdate);
		};
	});

	let navs = [
		{ label: 'Portal', icon: Home, link: '/portal' },
		{
			label: 'Profile',
			icon: User,
			link: '/portal/profile'
		},
		{ label: 'Sign out', icon: LogOut, link: '/auth/logout' }
	];
	

	$inspect(navigating.complete)
</script>

<Toaster />

<!-- Page transition loading overlay -->
{#if navigating.complete}
	<div 
		class="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all"
		in:fade={{ duration: 100 }}
		out:fade={{ duration: 300 }}
	>
		<div class="flex flex-col items-center gap-4">
			<LoaderCircle class="size-12 animate-spin text-primary" />
			<!-- <p class="text-lg font-medium">Loading...</p> -->
		</div>
	</div>
{/if}

{@render children()}

<div class="fixed inset-x-0 bottom-4 z-50 flex justify-center">
	<Dock
		direction="middle"
		let:mouseX
		let:distance
		let:magnification
		class="rounded-full bg-white/80 px-4 py-2 shadow-md backdrop-blur-sm"
	>
		{#each navs as item}
			{#if url.pathname === item.link}
				<a href={item.link}>
					<DockIcon
						{mouseX}
						{magnification}
						{distance}
						class="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
					>
						{@const Icon = item.icon}

						<Icon size={20} strokeWidth={1.2} />
					</DockIcon>
				</a>
			{:else}
				<a href={item.link}>
					<DockIcon {mouseX} {magnification} {distance} class="rounded-full p-2 hover:bg-gray-200">
						{@const Icon = item.icon}

						<Icon size={20} strokeWidth={1.2} />
					</DockIcon>
				</a>
			{/if}
		{/each}

		{#if session?.user}
			<div
				class="ml-2 flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium"
			>
				XP: {userXp}
			</div>
		{/if}
	</Dock>
</div>
