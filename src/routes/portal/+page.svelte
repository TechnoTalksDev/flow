<script lang="ts">
	import CreateForm from "$lib/createForm.svelte";
  import type { PageData } from "./$types";
  
  let { data }: { data: PageData } = $props();
</script>
<div class="flex flex-col items-center justify-center h-screen max-w-screen">
Your logged in 
  <CreateForm {data}/>
</div>

