const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/kramer';
const needsSsl = /render\.com|amazonaws|neon\.tech|supabase/.test(connectionString) || process.env.PGSSL === '1';

// Everything this site stores lives in its own schema, so it can share a database
// with another app without touching that app's tables.
const SCHEMA = 'kramer_shas';

const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  max: 5,
  options: `-c search_path=${SCHEMA}`,
});
pool.on('error', (e) => console.error('Database connection dropped:', e.message));

const many = async (text, params) => (await pool.query(text, params)).rows;
const one = async (text, params) => (await pool.query(text, params)).rows[0] || null;

async function migrate() {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS ${SCHEMA};
    SET search_path = ${SCHEMA};
    CREATE TABLE IF NOT EXISTS people (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      generation  TEXT NOT NULL,
      pin_hash    TEXT NOT NULL,
      is_admin    BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    -- One row per daf (Gemara) or perek (Mishnayos). The primary key is what stops
    -- two people from taking the same daf.
    CREATE TABLE IF NOT EXISTS claims (
      track       CHAR(1) NOT NULL,
      masechta    TEXT NOT NULL,
      unit        INT NOT NULL,
      person_id   INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      claimed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      learned_at  TIMESTAMPTZ,
      PRIMARY KEY (track, masechta, unit)
    );
    CREATE INDEX IF NOT EXISTS claims_person ON claims(person_id);
    CREATE TABLE IF NOT EXISTS session (
      sid    VARCHAR NOT NULL PRIMARY KEY,
      sess   JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS session_expire ON session(expire);
  `);
}

module.exports = { pool, many, one, migrate, SCHEMA };
