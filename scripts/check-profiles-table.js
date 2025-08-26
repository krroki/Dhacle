require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkProfilesTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if profiles is a table or a view
    const checkTableType = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles';
    `);
    
    console.log('Profiles table info:', checkTableType.rows);

    // Get columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nProfiles columns:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check for actual table structure using system catalogs
    const tableStructure = await pool.query(`
      SELECT 
        c.relname AS table_name,
        c.relkind,
        CASE c.relkind
          WHEN 'r' THEN 'table'
          WHEN 'v' THEN 'view'
          WHEN 'm' THEN 'materialized view'
          ELSE 'other'
        END AS type
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' 
      AND c.relname = 'profiles';
    `);
    
    console.log('\nActual table structure:', tableStructure.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkProfilesTable();