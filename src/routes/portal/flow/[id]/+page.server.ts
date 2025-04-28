import { taskSchema } from '$lib/schemas';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from '../../$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const taskId = params.id;

	const task = (async () => supabase.from('tasks').select('*').eq('id', taskId).single())();

	return {
		task
	};
};
