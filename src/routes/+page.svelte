<script>
	import BorderBeam from '$lib/components/BorderBeam.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		ArrowRight,
		CheckCircle,
		Timer,
		TrendingUp,
		ChevronRight,
		Clock,
		Brain,
		Star,
		Target,
		AlertCircle
	} from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
</script>

<div class="flex min-h-screen w-full flex-col items-center overflow-x-hidden">
	<!-- Hero Section -->
	<section class="relative flex min-h-[100vh] w-full flex-col items-center justify-center px-4 py-20">
		<!-- Gradient Blob -->
		<div
			class="absolute z-0 h-[650px] w-[600px] rounded-full opacity-30 blur-[100px]"
			style="background: radial-gradient(circle at center, #ffaa40, #9c40ff);"
		></div>
		
		<article
			class="relative z-10 flex max-w-3xl flex-col items-center justify-between rounded-3xl border border-gray-700/70 bg-background/60 p-8 text-center backdrop-blur-lg md:p-10"
		>
			<BorderBeam size={250} duration={12} />

			<Badge class="mb-4">Productivity Reimagined</Badge>

			<div class="relative mb-6">
				<h1
					class="absolute inset-0 bg-gradient-to-b from-white to-[#9c40ff] bg-clip-text text-7xl font-semibold text-transparent md:text-9xl blur-md"
				>
					Flow
				</h1>

				<h1
					class="relative bg-gradient-to-b from-white to-[#9c40ff] bg-clip-text text-7xl font-semibold text-transparent md:text-9xl"
				>
					Flow
				</h1>
			</div>

			<p class="mb-6 max-w-xl text-lg text-muted-foreground md:text-2xl">
				A science-backed productivity app designed to get you into the flow state and help you
				achieve more every day.
			</p>

			<div class="mt-2 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
				<Button href="/auth/login" size="lg" class="w-full sm:w-auto">
					Get Started <ArrowRight class="ml-2 h-4 w-4" />
				</Button>
				<Button href="#feat" variant="outline" size="lg" class="w-full sm:w-auto">
					Learn More <ChevronRight class="ml-2 h-4 w-4" />
				</Button>
			</div>

			<div
				class="mt-8 inline-flex animate-shine bg-[linear-gradient(110deg,#939393,45%,#1e2631,55%,#939393)] bg-[length:200%_100%] bg-clip-text text-xl font-medium text-transparent"
			>
				Turn time constraints into your superpower
			</div>
		</article>
	</section>

	<!-- Parkinson's Law Section -->
	<section class="w-full max-w-4xl px-4 py-16" id="problem">
		<div class="mb-12 text-center">
			<Badge variant="secondary" class="mb-2">The Problem</Badge>
			<h2 class="mb-4 text-3xl font-bold">Parkinson's Law: The Productivity Killer</h2>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
				"Work expands to fill the time available for its completion." — C. Northcote Parkinson, 1955
			</p>
		</div>

		<Card.Root class="mb-8 overflow-hidden border-gray-700/50">
			<Card.Header>
				<div class="mb-3 w-fit rounded-lg bg-primary/10 p-2">
					<AlertCircle class="h-6 w-6 text-primary" />
				</div>
				<Card.Title>Why Time Management Systems Fail</Card.Title>
				<Card.Description>
					Have you noticed that no matter how much time you allocate to a task, it somehow always
					expands to fill that entire window? That's Parkinson's Law in action, and it's been
					sabotaging productivity since 1955.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="mb-4">Parkinson's Law explains why:</p>
				<ul class="list-disc space-y-2 pl-5 text-muted-foreground">
					<li>Simple tasks take entire afternoons</li>
					<li>Projects expand well beyond their necessary scope</li>
					<li>Deadlines feel impossible until the last minute</li>
					<li>The more time you have, the more time you waste</li>
				</ul>
			</Card.Content>
		</Card.Root>

		<div class="mt-8 flex flex-col items-center justify-center text-center">
			<h3 class="mb-2 text-2xl font-bold">Flow is different.</h3>
			<p class="max-w-2xl text-muted-foreground">
				We've designed a system that turns Parkinson's Law on its head by using time constraints as
				a tool for focused productivity rather than an obstacle.
			</p>
		</div>
	</section>

	<!-- Features Section -->
	<section class="w-full max-w-6xl px-4 py-16" id="feat">
		<div class="mb-12 text-center">
			<Badge variant="outline" class="mb-2">Features</Badge>
			<h2 class="mb-4 text-3xl font-bold">Why Flow Works</h2>
			<p class="mx-auto max-w-2xl text-muted-foreground">
				Flow combines proven productivity techniques with gamification to help you achieve deep
				focus and accomplish your tasks in record time.
			</p>
		</div>

		<div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			<!-- Feature 1 -->
			<Card.Root class="overflow-hidden border-gray-700/50">
				<Card.Header>
					<div class="mb-3 w-fit rounded-lg bg-primary/10 p-2">
						<Timer class="h-6 w-6 text-primary" />
					</div>
					<Card.Title>Time-Boxed Flow Sessions</Card.Title>
					<Card.Description>
						Custom-length focus sessions that help you stay in the zone and accomplish more in less
						time.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="rounded-md bg-muted p-3 text-sm">
						<span class="font-semibold">Flow Fact:</span> Research shows you're up to 23% more productive
						when you work in dedicated time blocks.
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Feature 2 -->
			<Card.Root class="overflow-hidden border-gray-700/50">
				<Card.Header>
					<div class="mb-3 w-fit rounded-lg bg-primary/10 p-2">
						<TrendingUp class="h-6 w-6 text-primary" />
					</div>
					<Card.Title>XP Reward System</Card.Title>
					<Card.Description>
						Earn XP for completing tasks on time, turning productivity into a rewarding experience.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="rounded-md bg-muted p-3 text-sm">
						<span class="font-semibold">Flow Fact:</span> Immediate rewards through Gamification make
						you 40% more likely to maintain focused productivity habits.
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Feature 3 -->
			<Card.Root class="overflow-hidden border-gray-700/50">
				<Card.Header>
					<div class="mb-3 w-fit rounded-lg bg-primary/10 p-2">
						<Brain class="h-6 w-6 text-primary" />
					</div>
					<Card.Title>Deep Work Framework</Card.Title>
					<Card.Description>
						A structured environment that eliminates distractions and promotes higher cognitive
						performance in shorter time periods.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="rounded-md bg-muted p-3 text-sm">
						<span class="font-semibold">Flow Fact:</span> It takes an average of 23 minutes to refocus
						after being distracted, making uninterrupted sessions essential.
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="w-full max-w-6xl rounded-lg bg-muted/50 px-4 py-16" id="how">
		<div class="mb-12 text-center">
			<Badge variant="outline" class="mb-2">Workflow</Badge>
			<h2 class="mb-4 text-3xl font-bold">The Flow System</h2>
			<p class="mx-auto max-w-2xl text-muted-foreground">
				A simple but effective process to transform your productivity habits
			</p>
		</div>

		<div class="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
			<div class="flex flex-col items-center text-center">
				<div class="mb-5 w-fit rounded-full bg-primary/10 p-4">
					<Target class="h-8 w-8 text-primary" />
				</div>
				<h3 class="mb-2 text-xl font-bold">1. Create Tasks</h3>
				<p class="text-muted-foreground">
					Set clear objectives with realistic time estimates that challenge you to work efficiently
					rather than filling time.
				</p>
			</div>

			<div class="flex flex-col items-center text-center">
				<div class="mb-5 w-fit rounded-full bg-primary/10 p-4">
					<Clock class="h-8 w-8 text-primary" />
				</div>
				<h3 class="mb-2 text-xl font-bold">2. Enter Flow State</h3>
				<p class="text-muted-foreground">
					Lock in for focused work sessions with our distraction-free interface that creates urgency
					and counters time expansion.
				</p>
			</div>

			<div class="flex flex-col items-center text-center">
				<div class="mb-5 w-fit rounded-full bg-primary/10 p-4">
					<Star class="h-8 w-8 text-primary" />
				</div>
				<h3 class="mb-2 text-xl font-bold">3. Earn Rewards</h3>
				<p class="text-muted-foreground">
					Track your efficiency over time, earn XP for beating your estimates, and build lasting
					productivity habits.
				</p>
			</div>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="w-full max-w-3xl px-4 py-16" id="faq">
		<div class="mb-12 text-center">
			<Badge variant="outline" class="mb-2">FAQ</Badge>
			<h2 class="mb-4 text-3xl font-bold">Frequently Asked Questions</h2>
		</div>

		<Accordion.Root type="single" class="w-full">
			<Accordion.Item value="item-1">
				<Accordion.Trigger>What is the "flow state"?</Accordion.Trigger>
				<Accordion.Content>
					<p>
						Flow creates intentional time pressure through optimized time-boxing, which prevents
						work from expanding unnecessarily. By combining focused sessions with rewards for
						completing tasks efficiently, Flow encourages you to work with purpose rather than
						letting tasks expand to fill all available time.
					</p>
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="item-2">
				<Accordion.Trigger>How does the XP system work?</Accordion.Trigger>
				<Accordion.Content>
					<p>
						You earn XP points when you successfully complete tasks within your allocated flow time.
						Bonus XP is awarded for completing tasks before deadlines. Failed tasks may result in XP
						penalties, creating a balanced incentive system to encourage productive habits.
					</p>
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="item-3">
				<Accordion.Trigger>What if I need more time than I estimated?</Accordion.Trigger>
				<Accordion.Content>
					<p>
						Flow understands that estimation isn't perfect. If your flow timer runs out, you'll
						enter a grace period where you can choose to complete the task with reduced XP rewards
						or reset for another attempt. This flexibility helps you learn better time estimation
						without punishing you too harshly.
					</p>
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="item-4">
				<Accordion.Trigger>Can I organize my tasks?</Accordion.Trigger>
				<Accordion.Content>
					<p>
						Yes! Flow allows you to add custom tags to your tasks for easy organization. You can
						view tasks by due date, completion status, and more. The system helps you prioritize
						what's most important.
					</p>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>

	<!-- CTA Section -->
	<section class="w-full px-4 py-16" id="cta">
		<div
			class="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-gray-700/70 bg-background p-8 text-center md:p-10"
		>
			<BorderBeam size={150} duration={15} colorFrom="#ffaa40" colorTo="#9c40ff" />

			<h2 class="mb-6 text-3xl font-bold md:text-4xl">Ready to Transform Your Productivity?</h2>
			<p class="mx-auto mb-8 max-w-lg text-xl text-muted-foreground">
				Join thousands of users who have reclaimed their time and accomplished more than they
				thought possible.
			</p>
			<Button
				href="/auth/login"
				size="lg"
				class="inline-flex animate-shine items-center justify-center rounded-md border border-neutral-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-8 py-3 text-base font-medium text-white transition-colors"
			>
				Start Your Flow Journey
			</Button>
		</div>
	</section>
</div>
