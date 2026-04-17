import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const supabase = createClient(envVars['VITE_SUPABASE_URL'], envVars['VITE_SUPABASE_ANON_KEY']);
const uid = '7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f';

async function run() {
    console.log("Wiping test user from Supabase...");
    await supabase.from('expenses').delete().eq('user_id', uid);
    await supabase.from('recurring_charges').delete().eq('user_id', uid);
    await supabase.from('strategies').delete().eq('user_id', uid);
    await supabase.from('simulations').delete().eq('user_id', uid);
    await supabase.from('chat_messages').delete().eq('user_id', uid);
    await supabase.from('profiles').update({income: 0, fixed_expenses: 0, total_debts: 0, monthly_contribution: 0, emergency_fund_progress: 0, ai_context_summary: null}).eq('id', uid);
    console.log("OK!");
}
run();
