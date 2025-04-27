import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { delay } from '$lib/utils';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const session = await safeGetSession();
  
  if (!session?.user) {
    throw error(401, 'Authentication required');
  }
  
  const userId = session.user.id;
  
  // Use promise to enable streaming
  const userData = (async () => {
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('id, created_at, username, name, avatar, email, xp')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
      throw error(500, 'Error fetching user profile');
    }
    
    return data;
  })();
  
  // Fetch task statistics in parallel using promises for streaming
  const taskStats = (async () => {
    try {
      // Get total tasks count
      const { count: totalTasks, error: totalError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) throw totalError;
      
      // Get completed tasks count
      const { count: completedTasks, error: completedError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('completed', true);
      
      if (completedError) throw completedError;
      
      // Get failed tasks count
      const { count: failedTasks, error: failedError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('failed', true);
      
      if (failedError) throw failedError;
      
      return {
        total: totalTasks || 0,
        completed: completedTasks || 0,
        failed: failedTasks || 0,
        inProgress: (totalTasks || 0) - ((completedTasks || 0))
      };
    } catch (err) {
      console.error('Error fetching task stats:', err);
      throw error(500, 'Error fetching task statistics');
    }
  })();
  
  return {
    userData,
    taskStats
  };
};