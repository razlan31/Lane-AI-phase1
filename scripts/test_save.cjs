const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: You must set SUPABASE_URL and SUPABASE_ANON_KEY as environment variables when running this script.');
  console.error('Example (do NOT paste keys into chat):');
  console.error('SUPABASE_URL="https://<project>.supabase.co" SUPABASE_ANON_KEY="<anon key>" node scripts/test_save.cjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  try {
    console.log('Inserting worksheet...');
    const worksheetPayload = {
      venture_id: null,
      user_id: 'test-user-local',
      type: 'roi',
      inputs: { monthlyRevenueIncrease: 5000, monthlyCostChange: 500, months: 12, initialInvestment: 20000 },
      outputs: null
    };

    const { data: worksheetData, error: worksheetError } = await supabase.from('worksheets').insert([worksheetPayload]).select();
    console.log('worksheets insert result:', JSON.stringify({ worksheetData, worksheetError }, null, 2));

    console.log('Inserting timeline event...');
    const timelinePayload = {
      venture_id: null,
      user_id: 'test-user-local',
      kind: 'insight',
      title: 'Test ROI run',
      body: 'Inserted by scripts/test_save.cjs',
      payload: { test: true }
    };

    const { data: timelineData, error: timelineError } = await supabase.from('timeline_events').insert([timelinePayload]).select();
    console.log('timeline insert result:', JSON.stringify({ timelineData, timelineError }, null, 2));

    console.log('Done. If both error fields are null, DB insert succeeded.');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(2);
  }
})();
