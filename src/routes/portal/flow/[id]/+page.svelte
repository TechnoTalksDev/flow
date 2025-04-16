<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { ChevronLeft, ChevronRight, HeartCrack, SquarePen, Trash2 } from '@lucide/svelte';
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
	let { data }: { data: PageData } = $props();
	import { formatTime } from '$lib/utils';
	import { Confetti } from 'svelte-confetti';

	let task = $state(data.task);

	async function deleteTask(taskId: string) {
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
		} else {
			goto('/portal');
		}
	}

	$inspect(task);

	let duration = $state(task.time);
	let remaining = $state(duration);
	let started = $state(false);
	let intervalId: NodeJS.Timer | null = null;
	let done = $state(false);

	$effect(() => {
		//console.log(remaining, done)
		if (!(remaining > 0)) {
			delay(60000).then(() => {
				if (!done) {
					stopTimer();
				}
			});
		}
	});

	async function startTimer() {
		if (!task.started) {
			const now = new Date().toISOString();
			task.started = now;

			await updateTask(task.id, task);
			console.log('Set timestamp');
		} else {
			const startTime = new Date(task.started);
			const now = new Date();
			const diff = now.getTime() - startTime.getTime();
			const diffInSeconds = Math.floor(diff / 1000);
			console.log(diffInSeconds);
			if (task.time > diffInSeconds) {
				remaining = task.time - diffInSeconds;
				console.log('Resumed timer');
			} else {
				remaining = 0;
				if (task.first) {
					toast.error('Task failed :(', {
						description: 'The timer has already ended. You will not be recieving XP',
						duration: 5000,
						action: {
							label: 'Redirecting to portal',
							onClick: () => {
								//goto('/portal')
							}
						},

						position: 'top-center'
					});
					task.first = false;
					task.failed = true;
					updateTask(task.id, task);

					await delay(1000);

					goto('/portal');
				}
				console.log('Timer already ended');
			}
			console.log('Existing timestamp');
			console.log(diffInSeconds);
			console.log(task.started);
		}
		started = true;
		setInterval(() => {
			if (remaining > 0) {
				remaining--;
			} else {
			}
		}, 1000);
	}

	async function finishTask() {
		clearInterval(intervalId);
		intervalId = null;
		done = true;

		if (task.first) {
			if (remaining > 0) {
				await addXp(duration - remaining);
			} else {
				await addXp(task.time);
			}
			toast.success('Task completed :)', {
				description: 'Your XP will be added to your profile!',
				duration: 5000,
				action: {
					label: 'Redirecting to portal',
					onClick: () => {
						//goto('/portal')
					}
				},

				position: 'top-center'
			});
		} else {
			toast.error('Task completed again :)', {
				description: "Since this isn' your first time completing this task, you won't recieving XP",
				duration: 5000,
				action: {
					label: 'Redirecting to portal',
					onClick: () => {
						//goto('/portal')
					}
				},

				position: 'top-center'
			});
		}

		task.first = false;
		task.completed = true;
		task = task;
		updateTask(task.id, task);

		await delay(5000);
		goto('/portal');
	}

	async function stopTimer() {
		clearInterval(intervalId);
		intervalId = null;

		toast.error('Task failed :(', {
			description: 'You wont earn any XP for this task',
			duration: 5000,
			action: {
				label: 'Redirecting to portal',
				onClick: () => {
					//goto('/portal')
				}
			},

			position: 'top-center'
		});

		task.failed = true;
		task.first = false;
		updateTask(task.id, task);

		await delay(1000);

		goto('/portal');
	}
</script>

<div
	class="flex h-screen w-screen flex-col items-center justify-center overflow-y-auto overflow-x-hidden"
>
	<!--
	<Card.Root
		class="w-[350px] cursor-pointer shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-gray-400"
	>
		<Card.Header>
			<Card.Title>Timer</Card.Title>
		</Card.Header>
		<Card.Content class="text-center">
			<h1
				class="text-8xl animate-shine inline-flex bg-[linear-gradient(110deg,#939393,45%,#1e2631,55%,#939393)] bg-[length:200%_100%] bg-clip-text font-medium text-transparent"
			>
        {formatTime(remaining)}
			</h1>
		</Card.Content>

		<Card.Footer>

      {#if !started}
			<button
				class="animate-shine inline-flex w-full items-center justify-center rounded-md border border-neutral-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-4 py-2 text-sm font-medium text-white transition-colors"
				onclick={startTimer}
        disabled={started}
			>
				Start now
			</button>
      {:else}
        <Button variant="destructive" class="w-full">Pause (3 left)</Button>
      {/if}
		</Card.Footer>
	</Card.Root>
  -->
	<Card.Root
		class="w-[350px] cursor-pointer shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-gray-400"
	>
		<Card.Content class="sm:max-w-[425px]">
			<Card.Title class="flex w-full flex-row justify-between text-2xl">
				{task.name}
			</Card.Title>
			<Card.Description class="">{task.description}</Card.Description>
			{#if isBeforeToday(task.dueDate)}
				<p class="text-red-500">
					<strong>Overdue</strong>: {formatDate(task.dueDate)}
				</p>
			{:else if daysRemaining(task.dueDate) > 0}
				<p class="">Due: {formatDate(task.dueDate)}</p>
			{:else}
				<p class="font-semibold text-red-500">Due today</p>
			{/if}

			<div class="w-fit flex-row text-xl my-4">
				ETA: {getHoursAndMinutes(task.time).hours} H {getHoursAndMinutes(task.time).minutes} M
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
		</Card.Content>

		<Card.Footer class="flex w-full flex-col gap-2">
			{#if !task.failed}
				<AlertDialog.Root>
					<AlertDialog.Trigger class="w-full">
						{#if !task.started}
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
								Flow will <span class="text-red-500">auto fail</span> in <strong>1 minute</strong>
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
												You wont earn <strong>any</strong> XP for this task <HeartCrack
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
												class="border-yellow-500 border-[1] bg-transparent text-white transition-all duration-300"
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
							<!--
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger><AlertDialog.Action>Pause</AlertDialog.Action></Tooltip.Trigger>
                  <Tooltip.Content>
                    <p class="flex flex-row gap-2">You will <strong>half</strong> the XP for this task <HeartCrack size="20" color="red" /></p>
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
              -->
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{:else}
				<Button variant="destructive" class="w-full" disabled={true} href="/portal">Failed</Button>
			{/if}

			<Button class="w-full" variant="secondary" name="back" href="/portal"><ChevronLeft /></Button>
		</Card.Footer>
	</Card.Root>
</div>

{#if task.completed}
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
