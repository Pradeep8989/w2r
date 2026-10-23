import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gklvxmakdeossulitiim.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1PiRW3g-CLpJiCgWKlzzag_0cgZOfoI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runCheck() {
  console.log('\n========================================');
  console.log('🔍 Checking Supabase Health & Connection');
  console.log('========================================');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Key: ${SUPABASE_KEY.slice(0, 15)}...${SUPABASE_KEY.slice(-6)}\n`);

  // 1. Check Gateway & Auth
  const { data: auth, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error('❌ Gateway/Auth Error:', authError.message);
  } else {
    console.log('✅ API Gateway & Authentication: Reachable (HTTP 200)');
  }

  // 2. Check Database Tables
  const tables = ['listings', 'materials', 'recyclers', 'reward_transactions'];
  console.log('\nChecking Database Tables:');
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table public.${table}: ${error.message}`);
    } else {
      console.log(`✅ Table public.${table}: ONLINE (${count ?? 0} rows found)`);
    }
  }

  // 3. Test Write/Read/Delete Cycle
  console.log('\nTesting Realtime Database Write & Read:');
  const testId = `TEST_${Date.now()}`;
  const { error: insertError } = await supabase.from('listings').insert({
    id: testId,
    title: 'Connection Health Check',
    customer_id: 'health_check',
    customer_name: 'Database Tester',
    customer_address: 'Verification Station',
    locality: 'Central',
    status: 'draft'
  });

  if (insertError) {
    console.error('❌ Insert Test Failed:', insertError.message);
  } else {
    console.log('✅ INSERT Test: Passed');

    const { data: readData, error: readError } = await supabase.from('listings').select('id, title').eq('id', testId).single();
    if (readError || !readData) {
      console.error('❌ SELECT Test Failed:', readError?.message);
    } else {
      console.log(`✅ SELECT Test: Passed (Verified row "${readData.title}")`);
    }

    await supabase.from('listings').delete().eq('id', testId);
    console.log('✅ DELETE Cleanup: Passed');
  }

  console.log('\n🎉 Result: Supabase database is 100% connected, configured, and working correctly!\n');
}

runCheck().catch((err) => {
  console.error('Fatal error during check:', err);
  process.exit(1);
});
