<script lang="ts">
	import { invalidate } from '$app/navigation';
	import type { PageData } from './$types';
	import CreateForm from '$lib/createForm.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ChevronRight, LoaderCircle, RefreshCw, SquarePen, Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import {
		updateTask,
		getHoursAndMinutes,
		formatDate,
		isBeforeToday,
		daysRemaining,
		isToday
	} from '$lib/utils';
	import UpdateForm from '$lib/updateForm.svelte';
	import { fade } from 'svelte/transition';
	let { data }: { data: PageData } = $props();

	let clientTasks: any[] = $state([]);

	$effect(() => {
		data.tasks.then((tasks) => {
			clientTasks = tasks.data ?? [];
		});
	});

	//$inspect(clientTasks)

	async function refresh() {
		//console.log('Refreshing1...');
		await invalidate('portal');
	}

	async function deleteTask(taskId: string) {
		clientTasks = clientTasks.filter((task) => task.id !== taskId);
		toast.success('Task deleted');
		const response = await fetch(`/portal/api/delete/${taskId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		console.log(response);

		if (!response.ok) {
			toast.error('Failed to delete task');
			console.error('Failed to delete task', response);
		}
	}
</script>

<div class="flex h-fit w-full flex-col items-center justify-center">
	<h1 class="mb-4 mt-8 text-4xl font-semibold">Your tasks</h1>

	<Dialog.Root>
		<Dialog.Trigger>
			<Button variant="secondary" class="mb-4"
				>Create
				<SquarePen />
			</Button>
		</Dialog.Trigger>
		<Dialog.Content class="p-0">
			<CreateForm {data} />
		</Dialog.Content>
	</Dialog.Root>

	<button onclick={refresh} class="mb-8">
		<RefreshCw color="gray" />
	</button>

	{#await data.tasks}
		<div
			class="mb-8 flex flex-row items-center justify-center gap-2"
			transition:fade={{ duration: 100 }}
		>
			<p class="text-xl font-semibold">Refreshing</p>
			<LoaderCircle class="animate-spin" />
		</div>
	{:then wrapper}
		<div class="flex flex-col gap-4">
			{#each clientTasks as task, index}
				<Card.Root
					class="w-[350px] cursor-pointer shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-gray-400"
				>
					<Card.Content class="flex flex-row items-center justify-between">
						<div class="flex flex-row items-center">
							<Checkbox
								class="mr-3 scale-125"
								bind:checked={task.completed}
								onCheckedChange={() => {
									updateTask(task.id, task);
								}}
							/>
							<div class="flex flex-col">
								<div class="flex flex-row items-center gap-2">
									{#if !task.completed}
										<Card.Title class="text-xl">
											{task.name}
										</Card.Title>
									{:else}
										<Card.Title class="text-xl line-through opacity-50">
											{task.name}
										</Card.Title>
									{/if}

									{#if task.failed}
										<Badge variant="destructive" class="w-fit">Failed</Badge>
									{/if}
								</div>

								{#if isBeforeToday(task.dueDate)}
									<p class="text-red-500">{formatDate(task.dueDate)}</p>
								{:else if daysRemaining(task.dueDate) > 0}
									<p class="underline decoration-green-200">
										{daysRemaining(task.dueDate)} day(s) left
									</p>
								{:else}
									<p class="font-semibold text-red-500">Due today</p>
								{/if}

								<div class="mt-1 flex flex-row flex-wrap items-center gap-2">
									{#each task.tags as tag}
										<div
											class="flex w-fit place-items-center gap-2 rounded-md bg-secondary px-2 py-1 ring-offset-background transition-all hover:cursor-default hover:bg-secondary/90 aria-selected:bg-secondary/90 aria-selected:ring-2 aria-selected:ring-ring aria-selected:ring-offset-2"
										>
											<span>
												{tag}
											</span>
										</div>
									{/each}
								</div>
							</div>
						</div>

						<div class="w-fit">
							<Dialog.Root>
								<Dialog.Trigger class="">
									<Button variant="secondary" class="hover:scale-105">
										<ChevronRight />
									</Button>
								</Dialog.Trigger>

								<Dialog.Content class="overflow-y-auto">
									<Dialog.Header>
										<Dialog.Title class="flex w-full flex-row justify-between text-2xl">
											{task.name}
											<Sheet.Root>
												<Sheet.Trigger class="hover:scale-105">
													<SquarePen class="mr-2" />
												</Sheet.Trigger>
												<Sheet.Content class="p-0">
													<UpdateForm {task} id={task.id} />
												</Sheet.Content>
											</Sheet.Root>
										</Dialog.Title>
										<Dialog.Description>{task.description}</Dialog.Description>
										{#if isBeforeToday(task.dueDate)}
											<p class="text-red-500">
												<strong>Overdue</strong>: {formatDate(task.dueDate)}
											</p>
										{:else if daysRemaining(task.dueDate) > 0}
											<p class="">Due: {formatDate(task.dueDate)}</p>
										{:else}
											<p class="font-semibold text-red-500">Due today</p>
										{/if}
									</Dialog.Header>

									<div class="w-fit flex-row text-xl">
										ETA: {getHoursAndMinutes(task.time).hours} H {getHoursAndMinutes(task.time)
											.minutes} M
									</div>

									<div class="flex flex-row flex-wrap items-center gap-2">
										{#each task.tags as tag}
											<div
												class="flex w-fit place-items-center gap-2 rounded-md bg-secondary px-2 py-1 ring-offset-background transition-all hover:cursor-default hover:bg-secondary/90 aria-selected:bg-secondary/90 aria-selected:ring-2 aria-selected:ring-ring aria-selected:ring-offset-2"
											>
												<span>
													{tag}
												</span>
											</div>
										{/each}
									</div>

									<Dialog.Footer>
										<Button
											variant="destructive"
											class="scale-90 transition-all hover:scale-105"
											onclick={() => {
												deleteTask(task.id);
											}}><Trash2 /></Button
										>

										{#if !task.failed}
											<a href="/portal/flow/{task.id}" class="w-full">
												<button
													class="inline-flex w-full animate-shine items-center justify-center rounded-md border border-neutral-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-4 py-2 text-sm font-medium text-white transition-colors"
												>
													Start now
												</button>
											</a>
										{:else}
											<Button variant="destructive" class="w-full" disabled={true}>Failed</Button>
										{/if}
									</Dialog.Footer>
								</Dialog.Content>
							</Dialog.Root>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:catch error}
		<p>error loading tasks: {error.message}</p>
	{/await}
</div>
