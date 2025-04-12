<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import {
   DateFormatter,
   type DateValue,
   getLocalTimeZone
  } from "@internationalized/date";
  import { cn } from "$lib/utils.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
	import { taskSchema } from "./schemas";
	import { z } from "zod";

  const df = new DateFormatter("en-US", {
   dateStyle: "long"
  });
  
  let { value = $bindable<DateValue | undefined>(), parsed = $bindable()} = $props();
  
  let contentRef = $state<HTMLElement | null>(null);
 </script>
  
 <Popover.Root>
  <Popover.Trigger
   class={cn(
    buttonVariants({
     variant: "outline",
     class: "w-full justify-start text-left font-normal"
    }),
    !value && "text-muted-foreground"
   )}
  >
   <CalendarIcon />
   {value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date"}
  </Popover.Trigger>
  <Popover.Content bind:ref={contentRef} class="w-auto p-0">
   <Calendar class="w-full" type="single" bind:value 
   
    onValueChange={(v) => {
      if (v) {
        parsed = z.string().date().parse(v.toString());
      } else {
        parsed = "";
      }
    }}
   
   />
  </Popover.Content>
 </Popover.Root>