<script>
	import BorderBeam from '$lib/components/BorderBeam.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { ChevronRight } from '@lucide/svelte';
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<article
		class="relative flex max-w-xl flex-col items-start justify-between rounded-3xl border border-gray-700/70 bg-background p-7 text-center"
	>
		<BorderBeam size={150} duration={12} />

		<h1
			class="bg-gradient-to-b from-white to-neutral-700 bg-clip-text text-9xl font-semibold text-transparent"
		>
			Flow
		</h1>

		<div class="mt-2 flex flex-row items-center gap-4">
			<p>A new way to get things done</p>
			<Button href="/auth/login" variant="secondary">Start <ChevronRight class="-mb-1" /></Button>
		</div>
	</article>
</div>
