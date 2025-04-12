import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({
	request,
	params,
	locals: { supabase, safeGetSession }
}) => {
	const taskId = params.id;
	//console.log(`TASK ID -> ${taskId}`)
	if (!taskId) {
		throw error(400, { message: 'Missing task ID' });
	}

	const session = await safeGetSession();

	if (!session) {
		throw error(401, { message: 'Authentication required' });
	}

	const userId = session.user?.id;

	try {
		const { error: updateError } = await supabase.from('tasks').delete().eq('id', taskId);

		if (updateError) {
			console.error('Error deleting task:', updateError);
			throw error(500, { message: 'Failed to delete task' });
		}

		// Return success response
		return json(
			{
				success: true
			},
			{ status: 200 }
		);
	} catch (e) {
		// If it's not already a SvelteKit error, convert it
		if (!e || typeof e !== 'object' || !('status' in e)) {
			console.error('Unexpected error:', e);
			throw error(500, { message: 'Unknown error occurred' });
		}
		throw e; // Re-throw SvelteKit errors
	}
};
