const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*([^\r\n]+)/)[1].trim();
const supabaseAnonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*([^\r\n]+)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: programs } = await supabase
    .from('programs')
    .select('id, name, status');
  console.log('--- Programs ---');
  console.log(JSON.stringify(programs, null, 2));

  const { data: programCampuses } = await supabase
    .from('program_campuses')
    .select('id, program_id, campus_id');
  console.log('--- Program Campuses ---');
  console.log(JSON.stringify(programCampuses, null, 2));

  const { data: scholarshipPrograms } = await supabase
    .from('scholarship_programs')
    .select('*');
  console.log('--- Scholarship Programs Link ---');
  console.log(JSON.stringify(scholarshipPrograms, null, 2));
}

run();






