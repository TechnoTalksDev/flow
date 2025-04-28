import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function daysRemaining(dateString: string) {
	const date = new Date(dateString + 'T00:00:00');
	const today = new Date();

	// Strip time from both dates to compare only the date part
	date.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);

	return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateString: string) {
	const date = new Date(dateString + 'T00:00:00');
	const day = date.getDate();
	const year = date.getFullYear();
	const month = date.toLocaleString('default', { month: 'long' });
	//console.log(`${dateString} -> ${date}`)
	//console.log(date)
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

export function isToday(dateString: string) {
	const date = new Date(dateString + 'T00:00:00');
	const today = new Date();

	// Strip time from both dates to compare only the date part
	date.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);

	return date === today;
}

export function isBeforeToday(dateString: string) {
	const date = new Date(dateString + 'T00:00:00');
	const today = new Date();

	// Strip time from both dates to compare only the date part
	date.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);

	return date < today;
}

export function getHoursAndMinutes(seconds: number) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return { hours, minutes };
}

export async function updateTask(taskId: string, task: object) {
	const response = await fetch(`/portal/api/update/${taskId}`, {
		method: 'POST',
		body: JSON.stringify(task),
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

export function formatTime(seconds: number) {
	const mins = Math.floor(seconds / 60)
		.toString()
		.padStart(2, '0');
	const secs = (seconds % 60).toString().padStart(2, '0');
	return `${mins}:${secs}`;
}

export function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function addXp(amount: number) {
	console.log(`Adding ${amount} XP`);
	const response = await fetch(`/portal/api/xp/add/${amount}`, {
		method: 'POST'
	});

	// Create and dispatch custom event for XP update
	const event = new CustomEvent('xp-updated', { detail: { amount } });
	window.dispatchEvent(event);

	console.log(response);
}
