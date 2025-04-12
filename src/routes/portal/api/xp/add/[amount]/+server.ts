import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';


export const POST: RequestHandler = async ({ request,params, locals: { supabase, safeGetSession } }) => {
  //console.dir(body, {depth: null})
  const amount = params.amount;
  //console.log(`TASK ID -> ${taskId}`)
  if (!amount) {
    throw error(400, { message: 'Missing amount' });
  }

  const session = await safeGetSession();

  if (!session) {
    throw error(401, { message: 'Authentication required' });
  }

  const userId = session.user?.id;
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  console.log(profile)
  let newAmount:number = parseInt(profile?.xp) + parseInt(amount);

  try {
    const { error: updateError } = await supabase
      .from('users')
      .update({"xp": newAmount})
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw error(500, { message: 'Failed to update profile' });
    }


    // Return success response
    return json(
      {
        success: true,
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
