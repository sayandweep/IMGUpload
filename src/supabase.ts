import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://tlduqcdbmouhadxosjah.supabase.co';
const supabaseAnonkey = 'sb_secret_s45T56JBsHNr-1dJmYPUJQ_fuVzfWV9';

export const supabase = createClient(supabaseUrl, supabaseAnonkey)