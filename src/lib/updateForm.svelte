<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import { DateFormatter, type DateValue } from '@internationalized/date';
	import DatePicker from './datePicker.svelte';
	import { Textarea } from './components/ui/textarea';
	import { TagsInput } from './components/ui/tags-input';
	import { LoaderCircle } from '@lucide/svelte';
	import { fade, slide } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { Button } from './components/ui/button';
	import { invalidate } from '$app/navigation';
	import { delay } from './utils';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let { task, id }: { task: any; id: number } = $props();
	//$inspect(task);

	let loading = $state(false);

	let hours = $state(0);
	let minutes = $state(0);
	let dateValue = $state<DateValue | undefined>(undefined);

	let seconds = $derived((hours * 60 + minutes) * 60);
	//$inspect(seconds)

	let name = $state('');
	let description = $state('');
	let dueDate = $state();
	let tags = $state([]);

	if (task) {
		name = task.name;
		description = task.description;
		dueDate = task.dueDate;
		tags = task.tags;
		
		// Initialize time from task.time (seconds)
		if (task.time) {
			const totalMinutes = Math.floor(task.time / 60);
			hours = Math.floor(totalMinutes / 60);
			minutes = totalMinutes % 60;
		}
	}

	//$inspect(name, description, dueDate, tags, seconds)

	async function updateTask() {
		loading = true;
		//console.log(task);
		//console.log(id);

		if (!(name.length > 2 && description.length > 2 && dueDate && seconds > 0)) {
			toast.error('Please fill out all fields properly');
			loading = false;
			return;
		}
		if (
			task.name == name &&
			task.description == description &&
			task.dueDate == dueDate &&
			task.tags == tags &&
			task.time == seconds
		) {
			toast.warning('No changes detected');
			loading = false;
			return;
		}

		const response = await fetch(`/portal/api/update/${id}`, {
			method: 'POST',
			body: JSON.stringify({
				name,
				description,
				dueDate,
				time: seconds,
				tags
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			toast.error('Failed to update task');
			console.error('Failed to update task', response);
		} else {
			invalidate('portal');

			toast.success(`"${name}" task updated`);
		}

		loading = false;
	}
</script>

<form>
	<Card.Root class="max-h-screen w-full overflow-y-auto border-none shadow-none">
		<Card.Header>
			<Card.Title class="text-wrap">Update <span class="font-normal">{name}</span></Card.Title>
			<Card.Description
				>Update your task details. Note if you have already completed the task, you will not gain
				any new XP.</Card.Description
			>
		</Card.Header>

		<Card.Content class="flex flex-col gap-6">
			<div>
				<Label>Name</Label>
				<Input minlength={2} maxlength={50} bind:value={name} required />

				<Card.Description>Name your task</Card.Description>
			</div>

			<div>
				<Label>Description</Label>
				<Textarea bind:value={description} minlength={2} required />
				<Card.Description
					>Describe what you need to get done, it can lead to you being <a
						href="https://www.forbes.com/sites/markmurphy/2018/04/15/neuroscience-explains-why-you-need-to-write-down-your-goals-if-you-actually-want-to-achieve-them/"
						class="underline">23%</a
					> more productive!</Card.Description
				>
			</div>

			<!--
			<Form.Field {form} name="done">
				
					
						<Label>Done</Label>
            <div class="flex items-center space-x-2">
            <Checkbox {...props} bind:checked={$formData.done}/>
            <Label
              class="text-sm font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Completed
            </Label>
            </div>
					{/snippet}
				
				<Card.Description></Card.Description>
				
			</Form.Field>
      -->

			<div>
				<Label>Due</Label>
				<br />
				<DatePicker bind:value={dateValue} bind:parsed={dueDate} />
				<Card.Description>When do you need it done by?</Card.Description>
			</div>

			<div>
				<Label>Flow Duration</Label>
				
				<!-- Time Input Controls -->
				<div class="flex items-center gap-4">
					<div class="inline-flex items-center gap-2 p-3 bg-muted/30 rounded-lg border w-fit">
						<div class="flex flex-col items-center">
							<Input
								name=""
								type="number"
								class="w-14 h-10 text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								placeholder="0"
								min={0}
								max={23}
								bind:value={hours}
								required
							/>
							<span class="text-xs text-muted-foreground font-medium mt-1">HR</span>
						</div>
						
						<div class="text-xl text-muted-foreground font-light mb-4">:</div>
						
						<div class="flex flex-col items-center">
							<Input
								name=""
								type="number"
								class="w-14 h-10 text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								placeholder="00"
								min={0}
								max={59}
								bind:value={minutes}
								required
							/>
							<span class="text-xs text-muted-foreground font-medium mt-1">MIN</span>
						</div>
					</div>
					
					<!-- Quick Preset Buttons -->
					<div class="flex flex-wrap gap-2">
						<button
							type="button"
							class="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
							onclick={() => { hours = 0; minutes = 15; }}
						>
							15m
						</button>
						<button
							type="button"
							class="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
							onclick={() => { hours = 0; minutes = 30; }}
						>
							30m
						</button>
						<button
							type="button"
							class="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
							onclick={() => { hours = 0; minutes = 45; }}
						>
							45m
						</button>
						<button
							type="button"
							class="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
							onclick={() => { hours = 1; minutes = 0; }}
						>
							1h
						</button>
						<button
							type="button"
							class="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
							onclick={() => { hours = 1; minutes = 30; }}
						>
							1h 30m
						</button>
						<button
							type="button"
							class="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
							onclick={() => { hours = 2; minutes = 0; }}
						>
							2h
						</button>
						<button
							type="button"
							class="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
							onclick={() => { hours = 0; minutes = 0; }}
						>
							Clear
						</button>
					</div>
				</div>
				<Card.Description>How long does your flow state need to be?</Card.Description>
			</div>

			<div>
				<Label>Tags</Label>
				<TagsInput bind:value={tags} />
				<Card.Description>Help you organize your tasks</Card.Description>
			</div>
		</Card.Content>

		<Card.Footer class="flex justify-end">
			<Button type="submit" disabled={loading} onclick={updateTask}>Update</Button>
		</Card.Footer>
		{#if loading}
			<div class="mt-4 flex items-center justify-center" transition:slide>
				<div in:fade={{ duration: 1500 }}>
					<LoaderCircle class="animate-spin" />
				</div>
			</div>
		{/if}
	</Card.Root>
</form>
