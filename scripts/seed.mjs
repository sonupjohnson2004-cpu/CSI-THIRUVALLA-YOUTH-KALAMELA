import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), 'data', 'talent_show.db')}`;
const client = createClient({
  url: dbPath,
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});

const itemsData = [
  { id: 'ev_01', category: 'Solo Western Senior Girls', round: 'Finals', segment: 'Individual Music', order: 1, status: 'completed', fName: 'NICSU SUSAN LITTY', fDetails: 'Chest #281 • Kaviyoor', sName: 'SANDRA STANLEY', sDetails: 'Chest #531 • Tholassery', tName: 'MEENU SARA BABU', tDetails: 'Chest #431 • Othera' },
  { id: 'ev_02', category: 'Short Story English', round: 'Finals', segment: 'Literary Arts', order: 2, status: 'completed', fName: 'STOJI PAUL THOMAS', fDetails: 'Chest #351 • Melpadom', sName: 'HODGES PAUL JAMES', sDetails: 'Chest #134 • Eraviperoor', tName: 'CHRIS GEORGE RIJU', tDetails: 'Chest #261 • Kaviyoor' },
  { id: 'ev_03', category: 'Light Music Boys', round: 'Finals', segment: 'Individual Music', order: 3, status: 'completed', fName: 'BIJEESH ISSAC', fDetails: 'Chest #230 • Karikkuzhy', sName: 'ASHBIN REJI', sDetails: 'Chest #279 • Kunnamthanam', tName: 'SAM TITUS THOMAS', tDetails: 'Chest #397 • Mundiappally' },
  { id: 'ev_04', category: 'Solo Eastern Senior Boys', round: 'Finals', segment: 'Individual Music', order: 4, status: 'completed', fName: 'DR. EMIL GEORGE', fDetails: 'Chest #525 • Tholassery', sName: 'NEIL KURUVILA', sDetails: 'Chest #390 • Mundiapally', tName: 'JESWIN P VARGHESE', tDetails: 'Chest #254 • Kaviyoor' },
  { id: 'ev_05', category: 'Light Music Girls', round: 'Finals', segment: 'Individual Music', order: 5, status: 'completed', fName: 'ASIN ANNA ANEESH', fDetails: 'Chest #202 • Kannamkaramodi', sName: 'MAHUS GRACE', sDetails: 'Chest #406 • Mundukotta', tName: 'ALEENA MARIAM VARKEY', tDetails: 'Chest #527 • Tholassery' },
  { id: 'ev_06', category: 'Quartet', round: 'Finals', segment: 'Group Music', order: 6, status: 'completed', fName: 'Kaviyoor Unit', fDetails: 'Chest Q1 • Kaviyoor', sName: 'Tholassery Unit', sDetails: 'Chest Q3 • Tholassery', tName: 'Mundiapally Unit', tDetails: 'Chest Q2 • Mundiapally' },
  { id: 'ev_07', category: 'Solo Western Junior Boys', round: 'Finals', segment: 'Individual Music', order: 7, status: 'completed', fName: 'JERMIAH VARGHESE', fDetails: 'Chest #377 • Mundiappally', sName: 'LIJIN SAJI SAMUEL', sDetails: 'Chest #528 • Tholassery', tName: 'SANKEERTHAN MATHEW', tDetails: 'Chest #381 • Mundiappally' },
  { id: 'ev_08', category: 'Elocution Malayalam Senior', round: 'Finals', segment: 'Speech & Oratory', order: 8, status: 'completed', fName: 'JIMY SARA JACOB', fDetails: 'Chest #386 • Mundiapally', sName: 'SUREJ K ABBHRAHAM', sDetails: 'Chest #393 • Mundiapally', tName: 'MEENU SARA', tDetails: 'Chest #431 • Othera' },
  { id: 'ev_09', category: 'Solo Eastern Junior Boys', round: 'Finals', segment: 'Individual Music', order: 9, status: 'completed', fName: 'LIJIN SAJI SAMUEL', fDetails: 'Chest #528 • Tholassery', sName: 'JEREMIAH VARGHESE', sDetails: 'Chest #377 • Mundiappally', tName: 'SANKEERTHAN MATHEW', tDetails: 'Chest #381 • Mundiappally' },
  { id: 'ev_10', category: 'Pencil Drawing', round: 'Finals', segment: 'Fine Arts', order: 10, status: 'completed', fName: 'ASHLIN SHAJI', fDetails: 'Chest #302 • Kuttoor', sName: 'ETHEN ARTHUR SAMUEL', sDetails: 'Chest #535 • Tholassery', tName: 'ASHWIN CHERRY MATHEW', tDetails: 'Chest #382 • Mundiappally' },
  { id: 'ev_11', category: 'Solo Western Senior Boys', round: 'Finals', segment: 'Individual Music', order: 11, status: 'completed', fName: 'JESVIN P VARGHESE', fDetails: 'Chest #254 • Kaviyoor', sName: 'DR. EMIL GEORGE', sDetails: 'Chest #525 • Tholassery', tName: 'ABEL K GEORGE', tDetails: 'Chest #257 • Kaviyoor' },
  { id: 'ev_12', category: 'Cartoon Drawing', round: 'Finals', segment: 'Fine Arts', order: 12, status: 'completed', fName: 'TIJU STEPHEN', fDetails: 'Chest #283 • Kunnamthanam', sName: 'SURAJ K ABRAHAM', sDetails: 'Chest #393 • Mundiappally', tName: 'PRETTY ANNA JOHN', tDetails: 'Chest #391 • Mundiappally' },
  { id: 'ev_13', category: 'Solo Eastern Junior Girls', round: 'Finals', segment: 'Individual Music', order: 13, status: 'completed', fName: 'JEMIMA MOLLY SHAJI', fDetails: 'Chest #376 • Mundiappally', sName: 'DIYA SUSAN JOHNS', sDetails: 'Chest #529 • Tholassery', tName: 'EMILIA ANNA SAM', tDetails: 'Chest #375 • Mundiappally' },
  { id: 'ev_14', category: 'Water Colour Painting', round: 'Finals', segment: 'Fine Arts', order: 14, status: 'completed', fName: 'SANDRA STANLY', fDetails: 'Chest #532 • Tholassery', sName: 'BIBIN THOMAS', sDetails: 'Chest #281 • Kunnamthanam', tName: 'ASHLIN SHAJI', tDetails: 'Chest #302 • Kuttoor' },
  { id: 'ev_15', category: 'Solo Eastern Senior Girls', round: 'Finals', segment: 'Individual Music', order: 15, status: 'completed', fName: 'NICSU SUSAN LITTY', fDetails: 'Chest #251 • Kaviyoor', sName: 'SWETHA SUSAN ISSAC', sDetails: 'Chest #259 • Kaviyoor', tName: 'LEANA MERIN ISSAC', tDetails: 'Chest #531 • Tholassery' },
  { id: 'ev_16', category: 'Poetry Writing Malayalam', round: 'Finals', segment: 'Literary Arts', order: 16, status: 'completed', fName: 'LUDIYA JAYAN', fDetails: 'Chest #150 • Kalangara', sName: 'JOSSY SARA GEORGE', sDetails: 'Chest #476 • Thalavady', tName: 'SHERIMON P C', tDetails: 'Chest #405 • Mundukotta' },
  { id: 'ev_17', category: 'Solo Western Junior Girls', round: 'Finals', segment: 'Individual Music', order: 17, status: 'completed', fName: 'JEMIMA MOLLY SHAJI', fDetails: 'Chest #376 • Mundiappally', sName: 'ALEENA MARIAM VARKEY', sDetails: 'Chest #527 • Tholassery', tName: 'DIYA SUSAN JOHNS', tDetails: 'Chest #529 • Tholassery' },
  { id: 'ev_18', category: 'Essay Writing Malayalam Junior', round: 'Finals', segment: 'Literary Arts', order: 18, status: 'completed', fName: 'ALKHA SABU', fDetails: 'Chest #425 • Othera', sName: 'EMILIA ANNA SAM', sDetails: 'Chest #375 • Mundiapally', tName: 'ALEENA ALEX', tDetails: 'Chest #502 • Theepany' },
  { id: 'ev_19', category: 'Elocution Malayalam Junior', round: 'Finals', segment: 'Speech & Oratory', order: 19, status: 'completed', fName: 'ALFA MARY REJI', fDetails: 'Chest #451 • Povathoor', sName: 'LIVIA ANNA VARKEY', sDetails: 'Chest #379 • Mundiappally', tName: 'RAYANA MARIAM', tDetails: 'Chest #228 • Karikkuzhy' },
  { id: 'ev_20', category: 'Instrumental - Percussion', round: 'Finals', segment: 'Instrumental Music', order: 20, status: 'completed', fName: 'SHERIN REJI VARGHESE', fDetails: 'Chest #394 • Mundiappally', sName: 'ABIN BINU', sDetails: 'Chest #289 • Kunnamthanam', tName: 'EETHAN ARTHUR', tDetails: 'Chest #535 • Tholassery' },
  { id: 'ev_21', category: 'Elocution English Senior', round: 'Finals', segment: 'Speech & Oratory', order: 21, status: 'completed', fName: 'MICHAEL MARIAM NEBU', fDetails: 'Chest #389 • Mundiappally', sName: 'SOORAJ K ABHRAHAM', sDetails: 'Chest #393 • Mundiappally', tName: 'AMIT OOMMEN GEORGE', tDetails: 'Chest #537 • Tholassery' },
  { id: 'ev_22', category: 'Group Song', round: 'Finals', segment: 'Group Music', order: 22, status: 'completed', fName: 'Tholassery Unit', fDetails: 'Chest G7 • Tholassery', sName: 'Kaviyoor Unit', sDetails: 'Chest G3 • Kaviyoor', tName: 'Theeppani Unit', tDetails: 'Chest G6 • Theepani' },
  { id: 'ev_23', category: 'Elocution English Junior', round: 'Finals', segment: 'Speech & Oratory', order: 23, status: 'partially_announced', fName: 'JEREMIAH VARGHESE', fDetails: 'Chest #377 • Mundiappally', sName: 'JEMIMA MOLLY SHAJI', sDetails: 'Chest #376 • Mundiappally', tName: null, tDetails: null },
  { id: 'ev_24', category: 'Instrumental - Organ / Keyboard', round: 'Finals', segment: 'Instrumental Music', order: 24, status: 'pending', fName: null, fDetails: null, sName: null, sDetails: null, tName: null, tDetails: null },
  { id: 'ev_25', category: 'Instrumental - Violin', round: 'Finals', segment: 'Instrumental Music', order: 25, status: 'partially_announced', fName: 'CHRISTINE ELIZABETH', fDetails: 'Chest #384 • Mundiappally', sName: 'EMILIA ANNA SAM', sDetails: 'Chest #375 • Mundiappally', tName: null, tDetails: null },
  { id: 'ev_26', category: 'Classical Music', round: 'Finals', segment: 'Classical Vocals', order: 26, status: 'partially_announced', fName: 'DR. EMIL GEORGE', fDetails: 'Chest #525 • Tholassery', sName: null, sDetails: null, tName: null, tDetails: null },
  { id: 'ev_27', category: 'Short Story Malayalam', round: 'Finals', segment: 'Literary Arts', order: 27, status: 'completed', fName: 'JULIE JAMES', fDetails: 'Chest #285 • Kunnamthanam', sName: 'ALEYAMMA THOMAS', sDetails: 'Chest #501 • Theepani', tName: 'DEEPTHI MARY JOHN', tDetails: 'Chest #385 • Mundiappally' },
  { id: 'ev_28', category: 'Mimicry', round: 'Finals', segment: 'Performing Arts', order: 28, status: 'completed', fName: 'MATHEW K MATHEW', fDetails: 'Chest #263 • Kaviyoor', sName: 'ASHBIN REJI', sDetails: 'Chest #279 • Kunnamthanam', tName: 'JIMY SARA JACOB', tDetails: 'Chest #386 • Mundiappally' },
  { id: 'ev_29', category: 'Tableau', round: 'Finals', segment: 'Theatre & Dramatics', order: 29, status: 'completed', fName: 'Karikkuzhy Unit', fDetails: 'Chest T4 • Karikkuzhy', sName: 'Mundiapally Unit', sDetails: 'Chest T5 • Mundiapally', tName: 'Tholassery Unit', tDetails: 'Chest T8 • Tholassery' },
  { id: 'ev_30', category: 'Fancy Dress', round: 'Finals', segment: 'Performing Arts', order: 30, status: 'completed', fName: 'NANMA SHAJI', fDetails: 'Chest #536 • Tholassery', sName: 'ETHAN ARTHUR', sDetails: 'Chest #535 • Tholassery', tName: 'ABEX K & DEEPTHI MARY JOHN (Tied)', tDetails: 'Chest #275 (Kunnamthanam) & Chest #385 (Mundiappally)' },
  { id: 'ev_31', category: 'Essay Writing English Senior', round: 'Finals', segment: 'Literary Arts', order: 31, status: 'completed', fName: 'SUREJ K ABRAHAM', fDetails: 'Chest #393 • Mundiappally', sName: 'ASHIYA C BENJAMIN', sDetails: 'Chest #427 • Othera', tName: 'NEETHU MERIN JOSE & CHRISTEENA RAICHAL GEORGE (Tied)', tDetails: 'Chest #454 (Poovathoor) & Chest #253 (Kaviyoor)' },
  { id: 'ev_32', category: 'Monoact', round: 'Finals', segment: 'Theatre & Dramatics', order: 32, status: 'completed', fName: 'DR. EMIL GEORGE', fDetails: 'Chest #525 • Tholassery', sName: 'ALKA SABU', sDetails: 'Chest #425 • Othera', tName: 'JERUSA SIJU', tDetails: 'Chest #429 • Othera' },
  { id: 'ev_33', category: 'Mime', round: 'Finals', segment: 'Theatre & Dramatics', order: 33, status: 'completed', fName: 'Team M3', fDetails: 'Chest M3', sName: 'Team M2', sDetails: 'Chest M2', tName: 'Team M1', tDetails: 'Chest M1' },
  { id: 'ev_34', category: 'Poetry Writing English', round: 'Finals', segment: 'Literary Arts', order: 34, status: 'completed', fName: 'SUREJ K ABRAHAM', fDetails: 'Chest #393 • Mundiappally', sName: 'AMITH OOMMEN GEORGE', sDetails: 'Chest #537 • Tholassery', tName: 'NIBIN JOSE', tDetails: 'Chest #286 • Kunnamthanam' },
];

const churchData = [
  { unit: 'Karikuzhy', sec: 1, sl: 1, total: 26, scores: { 'Light Music Boys': 10, 'Tableau': 10, 'Elocution Mal Jr': 6 } },
  { unit: 'Kaviyoor', sec: 1, sl: 2, total: 90, scores: { 'Solo Western Sr Boys': 16, 'Solo Eastern Sr Boys': 6, 'Solo Western Sr Girls': 10, 'Solo Eastern Sr Girls': 18, 'Quartet': 10, 'Group Song': 8, 'Mimicry': 10, 'Short Story English': 6, 'Essay Eng SR': 6 } },
  { unit: 'Kumbanad', sec: 1, sl: 3, total: 0, scores: {} },
  { unit: 'Kunnamthanam', sec: 1, sl: 4, total: 64, scores: { 'Light Music Boys': 8, 'Instrumental Percussion': 8, 'Mimicry': 8, 'Fancy Dress': 6, 'Cartoon': 10, 'Water Colour': 8, 'Poetry English': 6, 'Short Story Malayalam': 10 } },
  { unit: 'Kuttoor', sec: 1, sl: 5, total: 16, scores: { 'Water Colour': 6, 'Pencil Drawing': 10 } },
  { unit: 'Mundiappally', sec: 1, sl: 6, total: 240, scores: { 'Light Music Boys': 6, 'Solo Western Jr Boys': 16, 'Solo Eastern Jr Boys': 14, 'Solo Eastern Sr Boys': 8, 'Solo Western Jr Girls': 10, 'Solo Eastern Jr Girls': 16, 'Instrumental VIOLIN': 18, 'Instrumental Percussion': 10, 'Quartet': 6, 'Tableau': 8, 'Mimicry': 6, 'Fancy Dress': 6, 'Cartoon': 14, 'Pencil Drawing': 6, 'Essay Eng SR': 10, 'Essay Mal JR': 8, 'Poetry English': 10, 'Short Story Malayalam': 6, 'Elocution Mal Jr': 8, 'Elocution Eng Jr': 18, 'Elocution Mal Sr': 18, 'Elocution Eng Sr': 18 } },
  { unit: 'Perumthuruthy', sec: 1, sl: 7, total: 0, scores: {} },
  { unit: 'Thalavady', sec: 1, sl: 8, total: 8, scores: { 'Poetry Malayalam': 8 } },
  { unit: 'Tholassery', sec: 1, sl: 9, total: 168, scores: { 'Solo Western Jr Boys': 8, 'Solo Eastern Jr Boys': 10, 'Solo Western Sr Boys': 8, 'Solo Eastern Sr Boys': 10, 'Light Music Girls': 6, 'Solo Western Jr Girls': 14, 'Solo Eastern Jr Girls': 8, 'Solo Western Sr Girls': 8, 'Solo Eastern Sr Girls': 6, 'Instrumental Percussion': 6, 'Quartet': 8, 'Group Song': 10, 'Tableau': 6, 'Mono Act': 10, 'Fancy Dress': 18, 'Water Colour': 10, 'Pencil Drawing': 8, 'Poetry English': 8, 'Elocution Eng Sr': 6 } },
  { unit: 'Poovathoor', sec: 1, sl: 10, total: 16, scores: { 'Essay Eng SR': 6, 'Elocution Mal Jr': 10 } },
  { unit: 'Warikkadu', sec: 1, sl: 11, total: 0, scores: {} },
  { unit: 'Valanjavattom', sec: 1, sl: 12, total: 0, scores: {} },
  { unit: 'Arayapuram', sec: 2, sl: 1, total: 0, scores: {} },
  { unit: 'Kaniyampara', sec: 2, sl: 2, total: 0, scores: {} },
  { unit: 'Kanjirapara', sec: 2, sl: 3, total: 0, scores: {} },
  { unit: 'Kannamkarmodi', sec: 2, sl: 4, total: 10, scores: { 'Light Music Girls': 10 } },
  { unit: 'Melpadam', sec: 2, sl: 5, total: 10, scores: { 'Short Story English': 10 } },
  { unit: 'Mundukotta', sec: 2, sl: 6, total: 14, scores: { 'Light Music Girls': 8, 'Poetry  Malayalam': 6 } },
  { unit: 'Othera', sec: 2, sl: 7, total: 44, scores: { 'Solo Western Sr Girls': 6, 'Mono Act': 14, 'Essay Eng SR': 8, 'Essay Mal JR': 10, 'Elocution Mal Sr': 6 } },
  { unit: 'Theepani', sec: 2, sl: 8, total: 22, scores: { 'Group Song': 6, 'Essay Mal JR': 8, 'Short Story Malayalam': 8 } },
  { unit: 'Eraviperoor', sec: 2, sl: 9, total: 8, scores: { 'Short Story English': 8 } },
  { unit: 'Kalangara', sec: 2, sl: 10, total: 10, scores: { 'Poetry  Malayalam': 10 } },
  { unit: 'kuttapuzha', sec: 2, sl: 11, total: 0, scores: {} },
];

async function seed() {
  console.log('--- Initializing & Seeding Talent Showcase Database ---');
  const now = new Date().toISOString();

  // Create tables
  await client.execute(`
    CREATE TABLE IF NOT EXISTS editions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      year INTEGER NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS result_items (
      id TEXT PRIMARY KEY,
      edition_id TEXT NOT NULL DEFAULT 'show_2026',
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
    CREATE TABLE IF NOT EXISTS church_points (
      id TEXT PRIMARY KEY,
      edition_id TEXT NOT NULL DEFAULT 'show_2026',
      sl_no INTEGER,
      section INTEGER DEFAULT 1,
      unit_name TEXT NOT NULL,
      total_points INTEGER DEFAULT 0,
      event_scores TEXT,
      rank INTEGER DEFAULT 1
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  await client.execute({
    sql: `INSERT OR REPLACE INTO editions (id, name, year, is_active, created_at, updated_at)
          VALUES ('show_2026', 'Annual Talent Showcase 2026', 2026, 1, ?, ?);`,
    args: [now, now],
  });

  await client.execute({
    sql: `INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('active_edition_id', 'show_2026');`,
    args: [],
  });

  // Seed Result Items
  await client.execute(`DELETE FROM result_items WHERE edition_id = 'show_2026'`);
  for (const item of itemsData) {
    await client.execute({
      sql: `INSERT INTO result_items (
        id, edition_id, category, round, segment, display_order, status,
        first_place_name, first_place_details,
        second_place_name, second_place_details,
        third_place_name, third_place_details,
        created_at, updated_at
      ) VALUES (?, 'show_2026', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        item.id, item.category, item.round, item.segment, item.order, item.status,
        item.fName, item.fDetails, item.sName, item.sDetails, item.tName, item.tDetails,
        now, now
      ],
    });
  }

  // Seed Church Points
  await client.execute(`DELETE FROM church_points WHERE edition_id = 'show_2026'`);
  const sorted = [...churchData].sort((a, b) => b.total - a.total);
  const ranks = {};
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].total < sorted[i - 1].total) {
      currentRank = i + 1;
    }
    ranks[sorted[i].unit] = currentRank;
  }

  for (const ch of churchData) {
    const chId = `cp_show_2026_s${ch.sec}_${ch.sl}`;
    await client.execute({
      sql: `INSERT INTO church_points (id, edition_id, sl_no, section, unit_name, total_points, event_scores, rank)
            VALUES (?, 'show_2026', ?, ?, ?, ?, ?, ?);`,
      args: [
        chId, ch.sl, ch.sec, ch.unit, ch.total, JSON.stringify(ch.scores), ranks[ch.unit]
      ],
    });
  }

  await client.execute({
    sql: `INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('last_updated_at', ?);`,
    args: [now],
  });

  console.log('--- Successfully seeded 34 items and 23 church units! ---');
}

seed().catch(console.error);
