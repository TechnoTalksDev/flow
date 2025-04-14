<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<div class="flex flex-col h-screen w-screen items-center justify-center">
	<Card.Root class="w-fit">
		<Card.Header>
      <div class="flex items-center space-x-4">
        <Skeleton class="size-12 rounded-full" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-[250px]" />
          <Skeleton class="h-4 w-[200px]" />
        </div>
      </div>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col items-center gap-2">

        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-full" />

      </div>

		</Card.Content>
		<Card.Footer>
			<Skeleton class="h-4 w-full" />
		</Card.Footer>
	</Card.Root>
</div>
