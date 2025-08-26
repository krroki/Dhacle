require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkProfilesViewDefinition() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Get view definition
    const viewDef = await pool.query(`
      SELECT pg_get_viewdef('public.profiles', true) AS view_definition;
    `);
    
    console.log('Profiles view definition:');
    console.log(viewDef.rows[0].view_definition);

    // List all tables to find potential profile tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name LIKE '%profile%'
      ORDER BY table_name;
    `);
    
    console.log('\nTables with "profile" in name:');
    tables.rows.forEach(t => console.log(`  - ${t.table_name}`));

    // Check users table structure
    const usersColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nUsers table columns:');
    usersColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkProfilesViewDefinition();