<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { formatDistance } from 'date-fns';
	import { ArrowRight, UserRound } from '@lucide/svelte';

	let { data } = $props();
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
						<p class="text-sm text-muted-foreground">{userData.email}</p>
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
							<p class="text-lg font-bold">{userData.xp || 0}</p>
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
									<p><span class="font-semibold">Total Tasks:</span></p>
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
									<p><span class="font-semibold">Total Tasks:</span></p>
									<p class="text-right">{stats.total}</p>
									<p><span class="font-semibold">Completed:</span></p>
									<p class="text-right text-green-600">{stats.completed}</p>
									<p><span class="font-semibold">Failed:</span></p>
									<p class="text-right text-red-600">{stats.failed}</p>
									<p><span class="font-semibold">In Progress:</span></p>
									<p class="text-right text-blue-600">{stats.inProgress}</p>
								</div>
							</div>
						{:catch}
							<div class="rounded-md bg-muted p-4 text-sm">
								<p class="text-center text-red-500">Failed to load task statistics</p>
							</div>
						{/await}
					</div>

					<div>
						<h3 class="mb-2 text-sm font-medium text-muted-foreground">Account Details</h3>
						<div class="rounded-md bg-muted p-4 text-sm">
							<p><span class="font-semibold">User ID:</span> {userData.id}</p>
							<p>
								<span class="font-semibold">Joined:</span>
								{new Date(userData.created_at).toLocaleDateString()}
							</p>
						</div>
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
