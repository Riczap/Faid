import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
  }
  
  const client = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false }  });
  
  try {
    const sql = `
      DO $$
      DECLARE
          row record;
      BEGIN
          FOR row IN
              SELECT conname
              FROM pg_constraint
              WHERE conrelid = 'public.recurring_charges'::regclass
                AND contype = 'c'
                AND pg_get_constraintdef(oid) LIKE '%type%'
          LOOP
              EXECUTE 'ALTER TABLE public.recurring_charges DROP CONSTRAINT ' || quote_ident(row.conname);
          END LOOP;
      END;
      $$;

      ALTER TABLE public.recurring_charges ADD CONSTRAINT recurring_charges_type_check 
      CHECK (type IN ('subscription', 'service', 'expense', 'other'));
    `;
    await client.query(sql);
    console.log('Successfully updated the CHECK constraint to include "other" type');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
