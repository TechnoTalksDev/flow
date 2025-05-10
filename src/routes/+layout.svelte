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
	import { Home, LogOut, Pencil, User, UserRound, LoaderCircle, Menu, X } from '@lucide/svelte';
	import TextShine from '$lib/components/TextShine.svelte';

	let { data, children } = $props();
	let { session, supabase, url } = $derived(data);
	let userXp = $state(0);
	let isSessionValid = $state(true);
	let refreshInProgress = $state(false);
	let lastRefreshAttempt = $state(0);
	let mobileMenuOpen = $state(false);

	// Random loading messages
	const loadingMessages = [
		'Generating quantum tunnels...',
		'Reticulating splines...',
		'Convincing AI not to take over the world...',
		'Brewing digital coffee for the servers...',
		'Herding pixel cats...',
		'Downloading more RAM...',
		'Teaching robots to dance...',
		"Untangling the internet's cables...",
		'Polishing the pixels...',
		'Summoning digital wizards...'
	];

	// Function to get a random loading message
	function getRandomLoadingMessage() {
		const randomIndex = Math.floor(Math.random() * loadingMessages.length);
		return loadingMessages[randomIndex];
	}

	// Current loading message
	let currentLoadingMessage = $state(getRandomLoadingMessage());

	// Update message when navigation starts
	$effect(() => {
		if (navigating.complete) {
			currentLoadingMessage = getRandomLoadingMessage();
		}
	});

	// Increase refresh cooldown to reduce API calls (15 seconds)
	const REFRESH_COOLDOWN = 15000;

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

	// Throttled token refresh function with better error handling
	async function throttledRefreshToken() {
		const now = Date.now();

		// Don't allow refreshes if one is in progress or if we've tried recently
		if (refreshInProgress || now - lastRefreshAttempt < REFRESH_COOLDOWN) {
			return false;
		}

		refreshInProgress = true;
		lastRefreshAttempt = now;

		try {
			// Use refreshSession only if we have a session
			if (!session) {
				refreshInProgress = false;
				return false;
			}

			const { data, error } = await supabase.auth.refreshSession();

			if (error) {
				// Handle specific error codes
				if (error.status === 400 && error.code === 'refresh_token_not_found') {
					// Token is completely invalid, better to log user out than keep trying
					console.warn('Refresh token not found, logging out');
					handleSessionExpiration();
				} else if (error.status === 429) {
					// Rate limited - back off significantly
					console.warn('Auth rate limited, backing off');
					lastRefreshAttempt = now + 60000; // Add a minute to backoff
				} else {
					console.error('Error refreshing token:', error);
				}
				return false;
			}

			if (data.session) {
				isSessionValid = true;
				// Update the local session data to avoid unnecessary refreshes
				invalidate('supabase:auth');
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
		// Attempt token refresh only if we have a session and it's approaching expiry
		if (session) {
			const expiresAt = session.expires_at ? session.expires_at * 1000 : 0; // convert to ms
			const now = Date.now();
			const timeToExpiry = expiresAt - now;

			// Only refresh if token expires in less than 5 minutes but is still valid
			if (timeToExpiry < 300000 && timeToExpiry > 0) {
				throttledRefreshToken();
			} else if (timeToExpiry <= 0) {
				// If token is already expired, don't try to refresh, just log out
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
			data.subscription?.unsubscribe?.();
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

	$inspect(navigating.complete);
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
			<TextShine>{currentLoadingMessage}</TextShine>
		</div>
	</div>
{/if}

{@render children()}

{#if session}
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
						<DockIcon
							{mouseX}
							{magnification}
							{distance}
							class="rounded-full p-2 hover:bg-gray-200"
						>
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
{:else}
	<div class="fixed inset-x-0 top-0 z-50">
		<nav class="bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
			<div class="container mx-auto flex items-center justify-between">
				<div class="flex items-center gap-2">
					<img src="/Flow.png" alt="Flow Logo" class="h-8 w-auto" />
					<h1
						class="bg-gradient-to-b from-white to-neutral-700 bg-clip-text text-xl font-semibold text-transparent"
					>
						Flow
					</h1>
				</div>

				<!-- Desktop Navigation -->
				<div class="hidden items-center gap-6 md:flex">
					<a href="#problem" class="text-gray-700 transition-colors hover:text-primary">Why?</a>
					<a href="#feat" class="text-gray-700 transition-colors hover:text-primary">Features</a>
					<a href="#faq" class="text-gray-700 transition-colors hover:text-primary">FAQ</a>
					<a href="/portal">
						<button
							class="inline-flex w-full animate-shine items-center justify-center rounded-xl border border-neutral-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-4 py-2 text-sm font-medium text-white transition-colors"
						>
							Get Started
						</button>
					</a>
				</div>

				<!-- Mobile hamburger button -->
				<button
					class="p-2 text-gray-700 transition-colors hover:text-primary md:hidden"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					aria-label="Toggle menu"
				>
					{#if mobileMenuOpen}
						<X size={24} />
					{:else}
						<Menu size={24} />
					{/if}
				</button>
			</div>

			<!-- Mobile dropdown menu -->
			{#if mobileMenuOpen}
				<div
					class="mt-1 border-t border-gray-200 bg-white/90 px-4 py-4 sm:px-6 md:hidden"
					transition:fade={{ duration: 150 }}
				>
					<div class="flex flex-col gap-4">
						<a href="#problem" class="py-2 text-gray-700 transition-colors hover:text-primary"
							>Why?</a
						>
						<a href="#feat" class="py-2 text-gray-700 transition-colors hover:text-primary"
							>Features</a
						>
						<a href="#faq" class="py-2 text-gray-700 transition-colors hover:text-primary">FAQ</a>
						<a href="/portal">
							<button
								class="inline-flex w-full animate-shine items-center justify-center rounded-xl border border-neutral-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-4 py-2 text-sm font-medium text-white transition-colors"
							>
								Get Started
							</button>
						</a>
					</div>
				</div>
			{/if}
		</nav>
	</div>
{/if}
