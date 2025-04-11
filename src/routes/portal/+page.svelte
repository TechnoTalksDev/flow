<script lang="ts">
	import CreateForm from '$lib/createForm.svelte';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { ChevronRight, Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();

	let tasks = $state(data.tasks);

	$effect(() => {
		tasks = data.tasks;
	});

	//$inspect(tasks);

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		const day = date.getDate();
		const year = date.getFullYear();
		const month = date.toLocaleString('default', { month: 'long' });

		const getOrdinal = (n: number) => {
			if (n > 3 && n < 21) return 'th';
			switch (n % 10) {
				case 1:
					return 'st';
				case 2:
					return 'nd';
				case 3:
					return 'rd';
				default:
					return 'th';
			}
		};

		const ordinal = getOrdinal(day);

		return `${month} ${day}${ordinal} ${year}`;
	}

	function isBeforeToday(dateString: string) {
		const inputDate = new Date(dateString);
		const today = new Date();

		// Strip time from both dates to compare only the date part
		inputDate.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);

		return inputDate < today;
	}

	function getHoursAndMinutes(seconds: number) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return { hours, minutes };
	}

	async function updateTask(taskId: string, task: object) {
		const response = await fetch(`/portal/api/update/${taskId}`, {
			method: 'POST',
			body: JSON.stringify(task),
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

  async function deleteTask(taskId: string) {
    tasks = tasks.filter(task => task.id !== taskId);
    toast.success("Task deleted")
    const response = await fetch(`/portal/api/delete/${taskId}`, {
      method: 'POST',
      headers: {
				'Content-Type': 'application/json'
			}
    });

    console.log(response)

    if (!response.ok) {
      toast.error("Failed to delete task")
      console.error('Failed to delete task', response);
    }
  }
</script>

<div class="max-w-screen flex h-fit flex-col items-center justify-center">
	{#if data.tasks}
		<h1 class="my-8 text-4xl font-semibold">Your tasks</h1>
		<Sheet.Root>
			<Sheet.Trigger class={buttonVariants({ variant: 'default' })}>Create</Sheet.Trigger>
			<Sheet.Content class="p-0">
				<CreateForm {data} />
			</Sheet.Content>
		</Sheet.Root>

		<div class="flex flex-col gap-4">
			{#each tasks as task, index}
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
								{#if !task.completed}
									<Card.Title>
										{task.name}
									</Card.Title>
								{:else}
									<Card.Title class="line-through opacity-50">
										{task.name}
									</Card.Title>
								{/if}

								{#if isBeforeToday(task.dueDate)}
									<p class="text-red-500">{formatDate(task.dueDate)}</p>
								{:else}
									<p class="">{formatDate(task.dueDate)}</p>
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

								<Dialog.Content class="sm:max-w-[425px]">
									<Dialog.Header>
										<Dialog.Title class="flex text-2xl w-full flex-row justify-between">
                      {task.name}
                    </Dialog.Title>
										<Dialog.Description>{task.description}</Dialog.Description>
										{#if isBeforeToday(task.dueDate)}
											<p class="text-sm text-red-500">Due: {formatDate(task.dueDate)}</p>
										{:else}
											<p class="text-sm">Due: {formatDate(task.dueDate)}</p>
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
                    
                    <Button variant="destructive" class="hover:scale-105 transition-all scale-90" onclick={() => {deleteTask(task.id)}}><Trash2 /></Button>
										
                    <a href="/portal/flow/{task.id}" class="w-full">
											<button
												class="animate-shine inline-flex w-full items-center justify-center rounded-md border border-neutral-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-4 py-2 text-sm font-medium text-white transition-colors"
											>
												Start now
											</button>
										</a>
                    
									</Dialog.Footer>
								</Dialog.Content>
							</Dialog.Root>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}

	<!--
  
  -->
</div>
