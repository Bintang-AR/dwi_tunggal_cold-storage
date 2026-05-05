import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('coverage')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
}