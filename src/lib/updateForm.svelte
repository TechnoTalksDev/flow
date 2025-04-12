<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import { DateFormatter } from '@internationalized/date';
	import DatePicker from './datePicker.svelte';
	import { Textarea } from './components/ui/textarea';
	import { TagsInput } from './components/ui/tags-input';
	import { LoaderCircle } from '@lucide/svelte';
	import { fade, slide } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { Button } from './components/ui/button';
	import { invalidateAll } from '$app/navigation';
	import { delay } from './utils';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let { task, id }: { task: any; id: number } = $props();
	//$inspect(task);

	let loading = $state(false);

	let hours = $state(0);
	let minutes = $state(0);

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
    if (task.name == name && task.description == description && task.dueDate == dueDate && task.tags == tags && task.time == seconds) {
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
      invalidateAll();

			toast.success(`"${name}" task updated`);
      
		}

		loading = false;
	}
</script>

<form>
	<Card.Root class="w-full">
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
        <Textarea bind:value={description} minlength={2}  required/>
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
        <br/>
        <DatePicker bind:parsed={dueDate} />
        <Card.Description>When do you need it done by?</Card.Description>
      </div>

			<div>
        <Label>Flow</Label>
        <div class="flex flex-row items-center gap-2">
          <Input name="" type="number" class="w-[60px] p-1" placeholder="0" bind:value={hours} min=0 required/>
          <Label class="mr-4">H</Label>
          <Input
            name=""
            type="number"
            class="w-[60px] p-1"
            max={59}
            min={0}
            placeholder="0"
            bind:value={minutes}
            required
          />
          <Label>M</Label>
        </div>
        <Card.Description>How long does your flow state need to be?</Card.Description>
      </div>

			<div>
        <Label>Tags</Label>
        <TagsInput bind:value={tags}/>
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
