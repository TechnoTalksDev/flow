<script lang="ts">
	import CreateForm from '$lib/createForm.svelte';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  
	let { data }: { data: PageData } = $props();

	let tasks = $state(data.tasks);
	
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


  function getHoursAndMinutes(seconds:number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { hours, minutes };
  }

  async function updateTask(taskId:string, task:object) {
    const response = await fetch(`/portal/api/update/${taskId}`, {
      method: 'POST',
      body: JSON.stringify(task),
      headers: {
				'Content-Type': 'application/json'
			}
    })
  }
</script>

<div class="max-w-screen flex h-fit flex-col items-center justify-center">
	{#if data.tasks}
		<h1 class="text-4xl font-semibold">Your tasks</h1>

		{#each tasks as task, index}
			<Card.Root class="w-[350px]">
				<Card.Content class="flex flex-row items-center justify-between">
					<div class="flex flex-row items-center">
						<Checkbox class="mr-2" bind:checked={task.completed} onCheckedChange={() => {updateTask(task.id, task)}}/>
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
						</div>
					</div>

					<div>
						{getHoursAndMinutes(task.time).hours} H {getHoursAndMinutes(task.time).minutes} M
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	{/if}

	<CreateForm {data} />
</div>
