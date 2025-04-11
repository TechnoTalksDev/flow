<script>
  import { invalidate } from '$app/navigation'
	import Header from '$lib/header.svelte';
  import { onMount } from 'svelte'

	import '../app.css';

  let { data, children } = $props()
  let { session, supabase } = $derived(data)

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    })

    return () => data.subscription.unsubscribe()
  })
</script>

<Header />

{@render children()}