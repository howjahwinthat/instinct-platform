import { supabase } from './supabase';

export async function updateStreak() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  const { data: streak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!streak) {
    // First time — create streak
    await supabase.from('user_streaks').insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    });
    return;
  }

  const last = streak.last_activity_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (last === today) return; // Already updated today

  const newStreak = last === yesterdayStr
    ? streak.current_streak + 1  // Consecutive day
    : 1;                          // Streak broken

  const longest = Math.max(newStreak, streak.longest_streak);

  await supabase.from('user_streaks').update({
    current_streak: newStreak,
    longest_streak: longest,
    last_activity_date: today,
    updated_at: new Date().toISOString(),
  }).eq('user_id', user.id);
}

export async function getStreak() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return data;
}