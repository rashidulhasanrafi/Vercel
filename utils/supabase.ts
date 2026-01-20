import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyxfyqmmxbmdtxzvmcyl.supabase.co';
const supabaseKey = 'sb_publishable_03RmmXU-pcDP2SIOsyuH4g_dXfAMz5-';

export const supabase = createClient(supabaseUrl, supabaseKey);