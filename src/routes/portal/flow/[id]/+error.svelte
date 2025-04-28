<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Separator } from '$lib/components/ui/separator';
	import { delay } from '$lib/utils';
	import { LoaderCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	onMount(() => {
		delay(3000).then(() => {
			goto('/portal');
		});
	});
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<h1 class="text-4xl">Something went wrong</h1>
	<p>You'll be returned to the portal in a few seconds</p>

	<p class="mt-4 text-gray-400">If this error persists, please contact the us</p>
	<p class="text-gray-400">{page.error?.message}</p>
	<div in:fade={{ duration: 1500 }} class="mt-2">
		<LoaderCircle class="animate-spin" />
	</div>
</div>
