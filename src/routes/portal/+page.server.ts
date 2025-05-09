import { taskSchema } from '$lib/schemas.js';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { delay } from '$lib/utils.js';

export const load: PageServerLoad = async ({ params, locals: { supabase }, depends }) => {
	console.log('Processing load...');

	// Get incomplete tasks sorted by soonest due date
	const tasks = (async () =>
		supabase
			.from('tasks')
			.select('*')
			.eq('completed', false)
			.order('dueDate', { ascending: true }))();

	// Get completed tasks sorted by most recent due date at the top
	// Load this after the incomplete tasks
	const completed = tasks.then(() =>
		supabase.from('tasks').select('*').eq('completed', true).order('dueDate', { ascending: false })
	);

	depends('portal');

	return {
		tasks,
		completed,
		form: await superValidate(zod(taskSchema))
	};
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(taskSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		let name = formData.get('name');
		let description = formData.get('description');
		let dueDate = new Date(formData.get('dueDate') as string).toISOString();
		let time = formData.get('time');
		let tags = JSON.parse(formData.get('tags') as string);
		//console.log(time)
		//console.log(name, description, dueDate, time, tags)

		const {
			data: { user },
			error: userError
		} = await supabase.auth.getUser();

		if (userError || !user) {
			console.error('User not authenticated:', userError);
			return { error: 'User not authenticated' };
		}

		const { data: insertData, error: insertError } = await supabase
			.from('tasks')
			.insert([
				{
					name,
					description,
					dueDate,
					time,
					tags,
					user_id: user.id
				}
			])
			.select()
			.order('completed', { ascending: true });

		//console.log(insertData)

		if (insertError) {
			console.error('Error inserting new record:', insertError);
			return { error: 'Error inserting new record' };
		}

		return {
			form
		};
	}
};
