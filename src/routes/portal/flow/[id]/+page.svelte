<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { ChevronLeft, HeartCrack, LoaderCircle } from '@lucide/svelte';
	import {
		updateTask,
		getHoursAndMinutes,
		formatDate,
		isBeforeToday,
		delay,
		addXp,
		daysRemaining
	} from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { formatTime } from '$lib/utils';
	import { Confetti } from 'svelte-confetti';
	import { onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';

	// Define interface for Task
	interface Task {
		id: string;
		name: string;
		description: string;
		dueDate: string;
		time: number;
		tags: string[];
		completed?: boolean;
		failed?: boolean;
		started?: string;
		first?: boolean;
	}

	let { data }: { data: PageData } = $props();

	// Use clientTask as the main state
	let clientTask = $state<Task | null>(null);

	$effect(() => {
		data.task.then((task) => {
			clientTask = task.data ?? [];
		});
	});

	// Track loading state
	let isLoading = $state(true);

	// Initialize timer variables
	let duration = $state(0);
	let durationMs = $state(0);
	let startedMs: number | null = $state(null);
	let remaining = $state(0);
	let started = $state(false);
	let intervalId: ReturnType<typeof setTimeout> | null = null;
	let done = $state(false);

	// Initialize timer when clientTask is loaded
	$effect(() => {
		if (clientTask) {
			duration = clientTask.time;
			durationMs = clientTask.time * 1000;
			remaining = duration;

			if (clientTask.started) {
				const startTime = new Date(clientTask.started);
				const now = new Date();
				const diff = now.getTime() - startTime.getTime();
				const diffInSeconds = Math.floor(diff / 1000);

				if (clientTask.time > diffInSeconds) {
					remaining = clientTask.time - diffInSeconds;
				} else {
					remaining = 0;
				}
			}
		}
	});

	async function deleteTask(taskId: string) {
		toast.success('Task deleted');
		const response = await fetch(`/portal/api/delete/${taskId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			toast.error('Failed to delete task');
			console.error('Failed to delete task', response);
		} else {
			goto('/portal');
		}
	}

	$effect(() => {
		if (!(remaining > 0)) {
			// Only start the auto-fail countdown if we're legitimately at 0
			if (started && !done) {
				delay(60000).then(() => {
					if (!done) {
						stopTimer();
					}
				});
			}
		}
	});

	function scheduleNext() {
		const now = Date.now();
		const elapsed = now - (startedMs ?? 0);
		const msLeft = Math.max(0, durationMs - elapsed);
		remaining = Math.ceil(msLeft / 1000);
		
		// If timer has ended, ensure we handle it properly
		if (msLeft <= 0) {
			remaining = 0;
			stopTimer();
			return;
		}
		
		// Calculate drift to maintain accuracy over time
		const drift = elapsed % 1000;
		
		// Clear any existing interval before setting a new one
		if (intervalId) clearTimeout(intervalId);
		
		// Schedule next update with drift compensation
		intervalId = setTimeout(scheduleNext, 1000 - drift);
	}

	async function startTimer() {
		if (!clientTask) return;

		if (!clientTask.started) {
			const now = new Date();
			clientTask.started = now.toISOString();

			await updateTask(clientTask.id, clientTask);
			console.log('Set timestamp');
		} else {
			const startTime = new Date(clientTask.started);
			const now = new Date();
			const diff = now.getTime() - startTime.getTime();
			const diffInSeconds = Math.floor(diff / 1000);

			if (clientTask.time > diffInSeconds) {
				remaining = clientTask.time - diffInSeconds;
				console.log('Resumed timer');
			} else {
				remaining = 0;
				if (clientTask.first) {
					toast.error('Task failed :(', {
						description: 'The timer has already ended. You will not be receiving XP',
						duration: 5000,
						action: {
							label: 'Redirecting to portal',
							onClick: () => {}
						},
						position: 'top-center'
					});
					clientTask.first = false;
					clientTask.failed = true;
					updateTask(clientTask.id, clientTask);

					await delay(1000);
					goto('/portal');
				}
			}
		}
		startedMs = new Date(clientTask.started).getTime();
		started = true;
		scheduleNext();
	}

	async function finishTask() {
		if (!clientTask) return;

		if (intervalId) clearTimeout(intervalId);
		intervalId = null;
		done = true;

		if (clientTask.first) {
			if (remaining > 0) {
				await addXp(duration - remaining);
			} else {
				await addXp(clientTask.time);
			}
			toast.success('Task completed :)', {
				description: 'Your XP will be added to your profile!',
				duration: 5000,
				action: {
					label: 'Redirecting to portal',
					onClick: () => {}
				},
				position: 'top-center'
			});
		} else {
			toast.error('Task completed again :)', {
				description:
					"Since this isn't your first time completing this task, you won't be receiving XP",
				duration: 5000,
				action: {
					label: 'Redirecting to portal',
					onClick: () => {}
				},
				position: 'top-center'
			});
		}

		clientTask.first = false;
		clientTask.completed = true;
		updateTask(clientTask.id, clientTask);

		await delay(5000);
		goto('/portal');
	}

	async function stopTimer() {
		if (!clientTask) return;

		// Ensure we clean up interval properly
		if (intervalId) {
			clearTimeout(intervalId);
			intervalId = null;
		}
		
		// Explicitly mark the timer as stopped
		started = false;
		done = true;

		// Calculate XP penalty (1/3 of the total possible XP)
		const xpPenalty = Math.ceil(clientTask.time / 3) * -1;

		toast.error('Task failed :(', {
			description: `You will lose ${Math.abs(xpPenalty)} XP for failing this task`,
			duration: 5000,
			action: {
				label: 'Redirecting to portal',
				onClick: () => {}
			},
			position: 'top-center'
		});

		// Apply XP penalty if this is the first attempt
		if (clientTask.first) {
			await addXp(xpPenalty);
		}

		clientTask.failed = true;
		clientTask.first = false;
		await updateTask(clientTask.id, clientTask);

		await delay(1000);
		goto('/portal');
	}

	onDestroy(() => {
		if (intervalId) clearTimeout(intervalId);
	});
</script>

<div
	class="flex h-screen w-screen flex-col items-center justify-center overflow-y-auto overflow-x-hidden"
>
	{#await data.task}
		<div class="flex flex-col items-center justify-center gap-4" in:fade={{ duration: 300 }}>
			<LoaderCircle class="size-12 animate-spin" />
			<p class="text-lg">Loading task...</p>
		</div>
	{:then taskData}
		{#if !clientTask}
			<div class="flex flex-col items-center justify-center gap-4" in:fade={{ duration: 300 }}>
				<LoaderCircle class="size-12 animate-spin" />
				<p class="text-lg">Preparing task...</p>
			</div>
		{:else}
			<Card.Root
				class="w-[350px] cursor-pointer shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-gray-400"
			>
				<Card.Content class="sm:max-w-[425px]">
					<Card.Title class="flex w-full flex-row justify-between text-2xl">
						{clientTask.name}
					</Card.Title>
					<Card.Description class="">{clientTask.description}</Card.Description>
					{#if isBeforeToday(clientTask.dueDate)}
						<p class="text-red-500">
							<strong>Overdue</strong>: {formatDate(clientTask.dueDate)}
						</p>
					{:else if daysRemaining(clientTask.dueDate) > 0}
						<p class="">Due: {formatDate(clientTask.dueDate)}</p>
					{:else}
						<p class="font-semibold text-red-500">Due today</p>
					{/if}

					<div class="my-4 w-fit flex-row text-xl">
						ETA: {getHoursAndMinutes(clientTask.time).hours} H {getHoursAndMinutes(clientTask.time)
							.minutes} M
					</div>

					<div class="flex flex-row flex-wrap items-center gap-2">
						{#each clientTask.tags as tag}
							<div
								class="flex w-fit place-items-center gap-2 rounded-md bg-secondary px-2 py-1 ring-offset-background transition-all hover:cursor-default hover:bg-secondary/90 aria-selected:bg-secondary/90 aria-selected:ring-2 aria-selected:ring-ring aria-selected:ring-offset-2"
							>
								<span>
									{tag}
								</span>
							</div>
						{/each}
					</div>
				</Card.Content>

				<Card.Footer class="flex w-full flex-col gap-2">
					{#if !clientTask.failed}
						<AlertDialog.Root>
							<AlertDialog.Trigger class="w-full">
								{#if !clientTask.started}
									<button
										class="inline-flex w-full animate-shine items-center justify-center rounded-md border border-neutral-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-4 py-2 text-sm font-medium text-white transition-colors"
										onclick={startTimer}
										disabled={started}
									>
										Start now
									</button>
								{:else}
									<button
										class="inline-flex w-full animate-shine items-center justify-center rounded-md border border-neutral-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-4 py-2 text-sm font-medium text-white transition-colors"
										onclick={startTimer}
										disabled={started}
									>
										Resume
									</button>
								{/if}
							</AlertDialog.Trigger>
							<AlertDialog.Content
								class="flex flex-col items-center justify-center border-none bg-white/10 text-center backdrop-blur-md"
							>
								<AlertDialog.Title class="text-5xl text-white">Focus</AlertDialog.Title>
								<AlertDialog.Description class="text-gray-300">
									Locked in for <strong>{formatTime(duration - remaining)}</strong>
								</AlertDialog.Description>

								<h1
									class="inline-flex animate-shine bg-[linear-gradient(110deg,#939393,45%,#1e2631,55%,#939393)] bg-[length:200%_100%] bg-clip-text text-8xl font-medium text-transparent"
								>
									{formatTime(remaining)}
								</h1>

								{#if !(remaining > 0)}
									<AlertDialog.Description class="text-gray-300">
										Flow will <span class="text-red-500">auto fail</span> in
										<strong>1 minute</strong>
									</AlertDialog.Description>
								{/if}

								<AlertDialog.Footer>
									{#if remaining > 0}
										<AlertDialog.Cancel
											onclick={finishTask}
											class="border-green-500 bg-transparent text-white transition-all duration-300"
											>Done</AlertDialog.Cancel
										>
										<Tooltip.Provider>
											<Tooltip.Root>
												<Tooltip.Trigger>
													<AlertDialog.Cancel
														onclick={stopTimer}
														class="border-red-500 bg-transparent text-white transition-all duration-300"
														>Stop</AlertDialog.Cancel
													>
												</Tooltip.Trigger>
												<Tooltip.Content>
													<p class="flex flex-row gap-2">
														You won't earn <strong>any</strong> XP for this task <HeartCrack
															size="20"
															color="red"
														/>
													</p>
												</Tooltip.Content>
											</Tooltip.Root>
										</Tooltip.Provider>
									{:else}
										<AlertDialog.Cancel
											onclick={finishTask}
											class="border-green-500 bg-transparent text-white transition-all duration-300"
											>Done</AlertDialog.Cancel
										>

										<Tooltip.Provider>
											<Tooltip.Root>
												<Tooltip.Trigger
													><AlertDialog.Action
														class="border-[1] border-yellow-500 bg-transparent text-white transition-all duration-300"
														>Need more time?</AlertDialog.Action
													></Tooltip.Trigger
												>
												<Tooltip.Content>
													<p class="flex flex-row gap-2">
														You will <strong>half</strong> the XP for this task <HeartCrack
															size="20"
															color="red"
														/>
													</p>
												</Tooltip.Content>
											</Tooltip.Root>
										</Tooltip.Provider>
									{/if}
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					{:else}
						<Button variant="destructive" class="w-full" disabled={true} href="/portal"
							>Failed</Button
						>
					{/if}

					<Button class="w-full" variant="secondary" name="back" href="/portal"
						><ChevronLeft /></Button
					>
				</Card.Footer>
			</Card.Root>
		{/if}
	{:catch error}
		<div
			class="flex flex-col items-center justify-center gap-4 p-6 text-center"
			in:fade={{ duration: 300 }}
		>
			<p class="text-lg text-red-500">Error loading task: {error.message}</p>
			<Button variant="secondary" href="/portal">Back to tasks</Button>
		</div>
	{/await}
</div>

{#if clientTask?.completed}
	<div
		style="
  position: fixed;
  top: -50px;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;"
	>
		<Confetti
			x={[-5, 5]}
			y={[0, 0.1]}
			delay={[500, 2000]}
			infinite
			duration={5000}
			amount={500}
			fallDistance="100vh"
		/>
	</div>
{/if}
