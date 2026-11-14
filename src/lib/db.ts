import { createClient, Client } from '@libsql/client';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { ResultItem, ResultItemInput } from '@/types';

// Detect database provider
const dbUrl = process.env.DATABASE_URL || 'file:./data/talent_show.db';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

let libsqlClient: Client | null = null;
let pgPool: pg.Pool | null = null;

function getLibSqlClient(): Client {
  if (!libsqlClient) {
    if (dbUrl.startsWith('file:')) {
      const dbPath = dbUrl.replace('file:', '');
      const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
      const dir = path.dirname(absPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      libsqlClient = createClient({
        url: `file:${absPath}`,
      });
    } else {
      libsqlClient = createClient({
        url: dbUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN || '',
      });
    }
  }
  return libsqlClient;
}

function getPgPool(): pg.Pool {
  if (!pgPool) {
    pgPool = new pg.Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' && !dbUrl.includes('localhost') ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pgPool;
}

let dbInitialized = false;

export async function initDb() {
  if (dbInitialized) return;

  if (isPostgres) {
    const pool = getPgPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS result_items (
        id VARCHAR(64) PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        round VARCHAR(100) NOT NULL DEFAULT 'Finals',
        segment VARCHAR(100),
        description TEXT,
        display_order INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        first_place_name VARCHAR(255),
        first_place_details TEXT,
        first_place_score VARCHAR(50),
        second_place_name VARCHAR(255),
        second_place_details TEXT,
        second_place_score VARCHAR(50),
        third_place_name VARCHAR(255),
        third_place_details TEXT,
        third_place_score VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS app_metadata (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  } else {
    const client = getLibSqlClient();
    await client.execute(`
      CREATE TABLE IF NOT EXISTS result_items (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        round TEXT NOT NULL DEFAULT 'Finals',
        segment TEXT,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        first_place_name TEXT,
        first_place_details TEXT,
        first_place_score TEXT,
        second_place_name TEXT,
        second_place_details TEXT,
        second_place_score TEXT,
        third_place_name TEXT,
        third_place_details TEXT,
        third_place_score TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  dbInitialized = true;
}

export function computeStatus(
  first?: string | null,
  second?: string | null,
  third?: string | null
): 'pending' | 'partially_announced' | 'completed' {
  const hasFirst = Boolean(first && first.trim());
  const hasSecond = Boolean(second && second.trim());
  const hasThird = Boolean(third && third.trim());

  if (hasFirst && hasSecond && hasThird) {
    return 'completed';
  }
  if (hasFirst || hasSecond || hasThird) {
    return 'partially_announced';
  }
  return 'pending';
}

export async function getAllResultItems(): Promise<ResultItem[]> {
  await initDb();
  if (isPostgres) {
    const pool = getPgPool();
    const res = await pool.query(
      `SELECT * FROM result_items ORDER BY display_order ASC, category ASC`
    );
    return res.rows.map(mapDbRowToResultItem);
  } else {
    const client = getLibSqlClient();
    const res = await client.execute(
      `SELECT * FROM result_items ORDER BY display_order ASC, category ASC`
    );
    return res.rows.map(mapDbRowToResultItem);
  }
}

export async function getResultItemById(id: string): Promise<ResultItem | null> {
  await initDb();
  if (isPostgres) {
    const pool = getPgPool();
    const res = await pool.query(`SELECT * FROM result_items WHERE id = $1`, [id]);
    if (res.rows.length === 0) return null;
    return mapDbRowToResultItem(res.rows[0]);
  } else {
    const client = getLibSqlClient();
    const res = await client.execute({
      sql: `SELECT * FROM result_items WHERE id = ?`,
      args: [id],
    });
    if (res.rows.length === 0) return null;
    return mapDbRowToResultItem(res.rows[0]);
  }
}

export async function createResultItem(input: ResultItemInput): Promise<ResultItem> {
  await initDb();
  const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  const status = computeStatus(
    input.first_place_name,
    input.second_place_name,
    input.third_place_name
  );

  const item: ResultItem = {
    ...input,
    id,
    status,
    created_at: now,
    updated_at: now,
  };

  if (isPostgres) {
    const pool = getPgPool();
    await pool.query(
      `INSERT INTO result_items (
        id, category, round, segment, description, display_order, status,
        first_place_name, first_place_details, first_place_score,
        second_place_name, second_place_details, second_place_score,
        third_place_name, third_place_details, third_place_score,
        notes, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [
        item.id,
        item.category,
        item.round || 'Finals',
        item.segment || null,
        item.description || null,
        item.display_order ?? 0,
        item.status,
        item.first_place_name || null,
        item.first_place_details || null,
        item.first_place_score || null,
        item.second_place_name || null,
        item.second_place_details || null,
        item.second_place_score || null,
        item.third_place_name || null,
        item.third_place_details || null,
        item.third_place_score || null,
        item.notes || null,
        item.created_at,
        item.updated_at,
      ]
    );
  } else {
    const client = getLibSqlClient();
    await client.execute({
      sql: `INSERT INTO result_items (
        id, category, round, segment, description, display_order, status,
        first_place_name, first_place_details, first_place_score,
        second_place_name, second_place_details, second_place_score,
        third_place_name, third_place_details, third_place_score,
        notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id,
        item.category,
        item.round || 'Finals',
        item.segment || null,
        item.description || null,
        item.display_order ?? 0,
        item.status,
        item.first_place_name || null,
        item.first_place_details || null,
        item.first_place_score || null,
        item.second_place_name || null,
        item.second_place_details || null,
        item.second_place_score || null,
        item.third_place_name || null,
        item.third_place_details || null,
        item.third_place_score || null,
        item.notes || null,
        item.created_at,
        item.updated_at,
      ],
    });
  }

  await touchLastUpdated();
  return item;
}

export async function updateResultItem(
  id: string,
  input: Partial<ResultItemInput>
): Promise<ResultItem | null> {
  await initDb();
  const existing = await getResultItemById(id);
  if (!existing) return null;

  const first = input.first_place_name !== undefined ? input.first_place_name : existing.first_place_name;
  const second = input.second_place_name !== undefined ? input.second_place_name : existing.second_place_name;
  const third = input.third_place_name !== undefined ? input.third_place_name : existing.third_place_name;
  const status = computeStatus(first, second, third);
  const now = new Date().toISOString();

  const updated: ResultItem = {
    ...existing,
    ...input,
    status,
    updated_at: now,
  };

  if (isPostgres) {
    const pool = getPgPool();
    await pool.query(
      `UPDATE result_items SET
        category = $1, round = $2, segment = $3, description = $4,
        display_order = $5, status = $6,
        first_place_name = $7, first_place_details = $8, first_place_score = $9,
        second_place_name = $10, second_place_details = $11, second_place_score = $12,
        third_place_name = $13, third_place_details = $14, third_place_score = $15,
        notes = $16, updated_at = $17
      WHERE id = $18`,
      [
        updated.category,
        updated.round,
        updated.segment || null,
        updated.description || null,
        updated.display_order ?? 0,
        updated.status,
        updated.first_place_name || null,
        updated.first_place_details || null,
        updated.first_place_score || null,
        updated.second_place_name || null,
        updated.second_place_details || null,
        updated.second_place_score || null,
        updated.third_place_name || null,
        updated.third_place_details || null,
        updated.third_place_score || null,
        updated.notes || null,
        updated.updated_at,
        id,
      ]
    );
  } else {
    const client = getLibSqlClient();
    await client.execute({
      sql: `UPDATE result_items SET
        category = ?, round = ?, segment = ?, description = ?,
        display_order = ?, status = ?,
        first_place_name = ?, first_place_details = ?, first_place_score = ?,
        second_place_name = ?, second_place_details = ?, second_place_score = ?,
        third_place_name = ?, third_place_details = ?, third_place_score = ?,
        notes = ?, updated_at = ?
      WHERE id = ?`,
      args: [
        updated.category,
        updated.round,
        updated.segment || null,
        updated.description || null,
        updated.display_order ?? 0,
        updated.status,
        updated.first_place_name || null,
        updated.first_place_details || null,
        updated.first_place_score || null,
        updated.second_place_name || null,
        updated.second_place_details || null,
        updated.second_place_score || null,
        updated.third_place_name || null,
        updated.third_place_details || null,
        updated.third_place_score || null,
        updated.notes || null,
        updated.updated_at,
        id,
      ],
    });
  }

  await touchLastUpdated();
  return updated;
}

export async function deleteResultItem(id: string): Promise<boolean> {
  await initDb();
  if (isPostgres) {
    const pool = getPgPool();
    const res = await pool.query(`DELETE FROM result_items WHERE id = $1`, [id]);
    await touchLastUpdated();
    return (res.rowCount ?? 0) > 0;
  } else {
    const client = getLibSqlClient();
    const res = await client.execute({
      sql: `DELETE FROM result_items WHERE id = ?`,
      args: [id],
    });
    await touchLastUpdated();
    return res.rowsAffected > 0;
  }
}

export async function getLastUpdated(): Promise<string> {
  await initDb();
  try {
    if (isPostgres) {
      const pool = getPgPool();
      const res = await pool.query(`SELECT value FROM app_metadata WHERE key = 'last_updated_at'`);
      return res.rows[0]?.value || new Date(0).toISOString();
    } else {
      const client = getLibSqlClient();
      const res = await client.execute({
        sql: `SELECT value FROM app_metadata WHERE key = 'last_updated_at'`,
        args: [],
      });
      return (res.rows[0]?.value as string) || new Date(0).toISOString();
    }
  } catch {
    return new Date().toISOString();
  }
}

export async function touchLastUpdated(): Promise<string> {
  await initDb();
  const now = new Date().toISOString();
  if (isPostgres) {
    const pool = getPgPool();
    await pool.query(
      `INSERT INTO app_metadata (key, value) VALUES ('last_updated_at', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [now]
    );
  } else {
    const client = getLibSqlClient();
    await client.execute({
      sql: `INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('last_updated_at', ?)`,
      args: [now],
    });
  }
  return now;
}

function mapDbRowToResultItem(row: any): ResultItem {
  return {
    id: String(row.id),
    category: String(row.category),
    round: String(row.round || 'Finals'),
    segment: row.segment ? String(row.segment) : null,
    description: row.description ? String(row.description) : null,
    display_order: Number(row.display_order ?? 0),
    status: (row.status || 'pending') as 'pending' | 'partially_announced' | 'completed',
    first_place_name: row.first_place_name ? String(row.first_place_name) : null,
    first_place_details: row.first_place_details ? String(row.first_place_details) : null,
    first_place_score: row.first_place_score ? String(row.first_place_score) : null,
    second_place_name: row.second_place_name ? String(row.second_place_name) : null,
    second_place_details: row.second_place_details ? String(row.second_place_details) : null,
    second_place_score: row.second_place_score ? String(row.second_place_score) : null,
    third_place_name: row.third_place_name ? String(row.third_place_name) : null,
    third_place_details: row.third_place_details ? String(row.third_place_details) : null,
    third_place_score: row.third_place_score ? String(row.third_place_score) : null,
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
