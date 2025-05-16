<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { LoaderCircle, LogOut } from '@lucide/svelte';
  import { onMount } from 'svelte';
  
  let error = '';
  let errorCode = '';
  let errorDescription = '';
  
  onMount(() => {
    // Get the hash fragment and remove the leading '#'
    const hash = window.location.hash.substring(1);
    
    // Parse the hash parameters
    const params = new URLSearchParams(hash);
    
    error = params.get('error') || '';
    errorCode = params.get('error_code') || '';
    errorDescription = params.get('error_description')?.replace(/\+/g, ' ') || '';
  });
</script>

<div class="w-screen h-screen flex flex-col items-center justify-center gap-4">
  
  {#if error}
    <h1 class="text-6xl font-semibold">
      {#if errorCode === 'signup_disabled'}
        Closed Beta
      {:else}
        Authentication Error
      {/if}
    </h1>
    
    {#if errorCode === 'signup_disabled'}
      <div class="max-w-md text-center text-gray-700">
        Flow is currently in closed beta
      </div>
      <Button href="https://tally.so/r/wA52zz" target="_blank">Get access</Button>
    {:else}
      {#if errorCode}
        <div class="text-red-600 font-medium">Error Code: {errorCode}</div>
      {/if}
      
      {#if errorDescription}
        <div class="max-w-md text-center text-gray-700">
          {errorDescription}
        </div>
      {/if} 
    {/if}

  {:else}
    <LoaderCircle size="10rem" class="animate-spin"/>
  {/if}
  <a href="/" class="mt-4 hover:scale-105 transition-transform duration-200">
    <LogOut />
  </a>


</div>