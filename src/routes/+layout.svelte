<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import Dock from '$lib/components/Dock.svelte';
	import DockIcon from '$lib/components/DockIcon.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Home, LogOut, Pencil, User, UserRound } from '@lucide/svelte';

	let { data, children } = $props();
	let { session, supabase, url } = $derived(data);
	let userXp = $state(0);
	let isSessionValid = $state(true);

	// Fetch user XP if logged in
	$effect(() => {
		async function fetchUserXp() {
			if (session?.user && isSessionValid) {
				try {
					const { data: userData, error } = await supabase
						.from('users')
						.select('xp')
						.eq('id', session.user.id)
						.single();

					if (error) {
						// Handle session expiration or other errors
						if (error.code === '402' || error.message?.includes('JWT')) {
							isSessionValid = false;
							console.log('Session appears to be expired, redirecting to login');
							// Redirect to login after a brief delay
							setTimeout(() => goto('/auth/logout'), 100);
							return;
						}
						console.error('Error fetching user data:', error);
						return;
					}

					if (userData) {
						userXp = userData.xp || 0;
					}
				} catch (err) {
					console.error('Error in fetchUserXp:', err);
				}
			}
		}

		fetchUserXp();
	});

	// Listen for XP updates
	onMount(() => {
		// Event listener for auth state changes
		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (event === 'SIGNED_OUT') {
				isSessionValid = false;
				userXp = 0;
			} else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
				isSessionValid = true;
			}
			
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// Event listener for XP updates
		const handleXpUpdate = async (event: Event) => {
			if (session?.user && isSessionValid) {
				try {
					const { data: userData, error } = await supabase
						.from('users')
						.select('xp')
						.eq('id', session.user.id)
						.single();

					if (error) {
						if (error.code === '402' || error.message?.includes('JWT')) {
							isSessionValid = false;
							return;
						}
						console.error('Error fetching updated XP:', error);
						return;
					}

					if (userData) {
						userXp = userData.xp || 0;
					}
				} catch (err) {
					console.error('Error in XP update handler:', err);
				}
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

	//$inspect(url.pathname)
</script>

<Toaster />

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
