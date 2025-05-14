<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { formatDistance, formatDuration, intervalToDuration } from 'date-fns';
	import { ArrowRight, UserRound } from '@lucide/svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	let { data } = $props();

	function secondsToHumanReadable(seconds:number) {
		const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
		return formatDuration(duration, { format: ['years', 'months', 'days', 'hours', 'minutes'], delimiter: ' ' });
	}

	let emailRevealed = $state("blur-sm");
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<Card.Root class="w-[400px] max-w-[98vw]">
		<Card.Header>
			{#await data.userData}
				<div class="flex items-center space-x-4">
					<Skeleton class="size-12 rounded-full" />
					<div class="space-y-2">
						<Skeleton class="h-4 w-[250px]" />
						<Skeleton class="h-4 w-[200px]" />
					</div>
				</div>
			{:then userData}
				<div class="flex items-center space-x-4">
					{#if userData?.avatar}
						<img src={userData.avatar} alt="Profile" class="size-12 rounded-full" />
					{:else}
						<div class="flex size-12 items-center justify-center rounded-full bg-muted">
							<UserRound class="size-6 text-muted-foreground" />
						</div>
					{/if}
					<div class="space-y-1">
						<h2 class="text-xl font-bold">{userData.username ?? userData.name}</h2>
						<button onclick={() => emailRevealed = emailRevealed === "blur-sm" ? "" : "blur-sm"}>
							<p class="text-sm text-muted-foreground {emailRevealed} transition-all duration-100">{userData.email}</p>
						</button>
					</div>
				</div>
			{:catch error}
				<div class="p-4 text-center">
					<p class="text-red-500">Failed to load profile data</p>
				</div>
			{/await}
		</Card.Header>
		<Card.Content>
			{#await data.userData}
				<div class="flex flex-col items-center gap-2">
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-4 w-full" />
				</div>
			{:then userData}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<h3 class="text-sm font-medium text-muted-foreground">XP</h3>
							<p class="text-lg font-bold gradient-heading">{userData.xp || 0}</p>
						</div>
						<div>
							<h3 class="text-sm font-medium text-muted-foreground">Account Age</h3>
							<p class="text-lg">{formatDistance(new Date(), new Date(userData.created_at))}</p>
						</div>
					</div>

					<div>
						<h3 class="mb-2 text-sm font-medium text-muted-foreground">Account Stats</h3>
						{#await data.taskStats}
							<div class="rounded-md bg-muted p-4 text-sm">
								<div class="grid grid-cols-2 gap-y-2">
									<p><span class="font-semibold">Total:</span></p>
									<Skeleton class="h-4 w-16" />
									<p><span class="font-semibold">Completed:</span></p>
									<Skeleton class="h-4 w-16" />
									<p><span class="font-semibold">Failed:</span></p>
									<Skeleton class="h-4 w-16" />
									<p><span class="font-semibold">In Progress:</span></p>
									<Skeleton class="h-4 w-16" />
								</div>
							</div>
						{:then stats}
							<div class="rounded-md bg-muted p-4 text-sm">
								<div class="grid grid-cols-2 gap-y-2">
									<p><span class="font-semibold">Total:</span></p>
									<p class="text-right">{stats.total}</p>
									<p><span class="font-semibold">Completed:</span></p>
									<p class="text-right text-green-600">{stats.completed}</p>

									<p><span class="font-semibold">Failed:</span></p>
									<p class="text-right text-red-600">{stats.failed}</p>
									<p><span class="font-semibold">In Progress:</span></p>
									<p class="text-right text-blue-600">{stats.inProgress}</p>


									<p><span class="font-semibold">Locked in for</span></p>
									<p class="text-right font-semibold gradient-primary-secondary ">{secondsToHumanReadable(stats.totalTime)}</p>
								</div>
							</div>
						{:catch}
							<div class="rounded-md bg-muted p-4 text-sm">
								<p class="text-center text-red-500">Failed to load task statistics</p>
							</div>
						{/await}
					</div>

					<div>
						<Accordion.Root type="single" class="border-none">
							<Accordion.Item value="account-details" class="border-none mb-0 pb-0">
								<Accordion.Trigger class="pb-0 mb-0">
									<h3 class="mb-2 text-sm font-medium text-muted-foreground">Account Details</h3>
								</Accordion.Trigger>
								<Accordion.Content>
									<div class="rounded-md bg-muted p-4 text-sm">
										<p><span class="font-semibold">User ID:</span> {userData.id}</p>
										<p>
											<span class="font-semibold">Joined:</span>
											{new Date(userData.created_at).toLocaleDateString()}
										</p>
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</div>
				</div>
			{:catch error}
				<div class="p-4 text-center">
					<p>Error loading profile information. Please try again later.</p>
				</div>
			{/await}
		</Card.Content>
		<Card.Footer>
			{#await data.userData}
				<Skeleton class="h-4 w-full" />
			{:then userData}
				<a href=""
					><p class="flex flex-row text-center text-sm text-muted-foreground">
						Share <ArrowRight size="20px" />
					</p></a
				>
			{:catch}
				<p class="text-center text-sm text-red-500">Error</p>
			{/await}
		</Card.Footer>
	</Card.Root>
</div>
