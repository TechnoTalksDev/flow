<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { taskSchema, type TaskSchema } from '$lib/schemas.js';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import DatePicker from './datePicker.svelte';
	import { browser } from '$app/environment';
	import Checkbox from './components/ui/checkbox/checkbox.svelte';
	import Label from './components/ui/label/label.svelte';
	import { Textarea } from './components/ui/textarea';
	import { TagsInput } from './components/ui/tags-input';
	import { LoaderCircle } from '@lucide/svelte';
	import { fade, slide } from 'svelte/transition';
	import { toast } from 'svelte-sonner';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let { data }: { data: { form: SuperValidated<Infer<TaskSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(taskSchema),
		onSubmit: ({ action, formData, formElement, controller, submitter, cancel }) => {
			loading = true;
		},
		onResult: ({ result, formEl, cancel }) => {
			loading = false;
			console.log(`Superform response: ${result.status}`);
			if (result.status === 200) {
				toast.success(`"${$formData.name}" task created`);
			} else {
				toast.error(`Something went wrong :(`);
			}
		}
	});

	const { form: formData, enhance } = form;

	let loading = $state(false);

	let hours = $state(0);
	let minutes = $state(0);

	let seconds = $derived((hours * 60 + minutes) * 60);
	//$inspect(seconds)
</script>

<form method="POST" action="/portal?/create" use:enhance>
	<Card.Root class="max-h-screen w-full overflow-y-auto">
		<Card.Header>
			<Card.Title>Create a task</Card.Title>
			<Card.Description
				>Outline your task in detail and provide how long you will need to complete it</Card.Description
			>
		</Card.Header>

		<Card.Content>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.Description>Name your task</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<Textarea {...props} bind:value={$formData.description} />
					{/snippet}
				</Form.Control>
				<Form.Description
					>Describe what you need to get done, it can lead to you being <a
						href="https://www.forbes.com/sites/markmurphy/2018/04/15/neuroscience-explains-why-you-need-to-write-down-your-goals-if-you-actually-want-to-achieve-them/"
						class="underline">23%</a
					> more productive!</Form.Description
				>
				<Form.FieldErrors />
			</Form.Field>

			<!--
			<Form.Field {form} name="done">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Done</Form.Label>
            <div class="flex items-center space-x-2">
            <Checkbox {...props} bind:checked={$formData.done}/>
            <Label
              class="text-sm font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Completed
            </Label>
            </div>
					{/snippet}
				</Form.Control>
				<Form.Description></Form.Description>
				<Form.FieldErrors />
			</Form.Field>
      -->

			<Form.Field {form} name="dueDate">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Due</Form.Label>
						<DatePicker bind:parsed={$formData.dueDate} />
						<input type="hidden" name="dueDate" value={$formData.dueDate} />
					{/snippet}
				</Form.Control>
				<Form.Description>When do you need it done by?</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="time">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Flow</Form.Label>
						<div class="flex flex-row items-center gap-2">
							<Input
								{...props}
								name=""
								type="number"
								class="w-[60px] p-1"
								placeholder="0"
								bind:value={hours}
							/>
							<Form.Label class="mr-4">H</Form.Label>
							<Input
								{...props}
								name=""
								type="number"
								class="w-[60px] p-1"
								max={59}
								min={0}
								placeholder="0"
								bind:value={minutes}
							/>
							<Form.Label>M</Form.Label>
						</div>
						<input type="hidden" name="time" bind:value={seconds} />
					{/snippet}
				</Form.Control>
				<Form.Description>How long does your flow state need to be?</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="tags">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Tags</Form.Label>
						<TagsInput bind:value={$formData.tags} />
						<input type="hidden" name="tags" value={JSON.stringify($formData.tags)} />
					{/snippet}
				</Form.Control>
				<Form.Description>Help you organize your tasks</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>

		<Card.Footer class="flex justify-end">
			<Form.Button type="submit" disabled={loading}>Create</Form.Button>
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
