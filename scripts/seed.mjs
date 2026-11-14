import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

const dbPath = path.resolve(process.cwd(), 'data', 'talent_show.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const client = createClient({
  url: `file:${dbPath}`,
});

async function seed() {
  console.log('--- Initializing Talent Show Database ---');

  // Create tables
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

  console.log('Tables verified.');

  // Clean existing sample items
  await client.execute(`DELETE FROM result_items`);

  const initialItems = [
    {
      id: 'item_seed_1',
      category: 'Vocal Solo - Classical & Semi-Classical',
      round: 'Finals',
      segment: 'Morning Session (Auditorium A)',
      description: 'Individual classical and semi-classical vocal performances judged on pitch, rhythm, and expression.',
      display_order: 1,
      status: 'completed',
      first_place_name: 'Sophia Chen',
      first_place_details: 'St. Jude Academy • Performance: "Clair de Lune"',
      first_place_score: '98.5',
      second_place_name: 'Liam O\'Connor',
      second_place_details: 'Oakridge High • Performance: "Ave Maria"',
      second_place_score: '96.0',
      third_place_name: 'Maya Patel',
      third_place_details: 'Green Valley School • Performance: "O Mio Babbino Caro"',
      third_place_score: '94.5',
      notes: 'Unanimous decision by judges panel.',
    },
    {
      id: 'item_seed_2',
      category: 'Contemporary Group Dance',
      round: 'Championship',
      segment: 'Evening Gala',
      description: 'Synchronized contemporary routines with 4 to 12 performers.',
      display_order: 2,
      status: 'partially_announced',
      first_place_name: 'The Kinetic Crew',
      first_place_details: '8 Dancers • Routine: "Metamorphosis"',
      first_place_score: '99.0',
      second_place_name: 'Lumina Dance Collective',
      second_place_details: '6 Dancers • Routine: "Echoes of Dawn"',
      second_place_score: '97.2',
      third_place_name: null,
      third_place_details: null,
      third_place_score: null,
      notes: '3rd place pending judges score reconciliation.',
    },
    {
      id: 'item_seed_3',
      category: 'Stand-up Comedy & Satire',
      round: 'Finals',
      segment: 'Evening Gala',
      description: 'Original comedic monologues and observational humor.',
      display_order: 3,
      status: 'partially_announced',
      first_place_name: 'Ethan Miller',
      first_place_details: 'Act: "Living with Artificial Intelligence"',
      first_place_score: '95.0',
      second_place_name: null,
      second_place_details: null,
      second_place_score: null,
      third_place_name: null,
      third_place_details: null,
      third_place_score: null,
      notes: 'Runner-ups to be announced at 8:30 PM.',
    },
    {
      id: 'item_seed_4',
      category: 'Instrumental Solo - Piano & Violin',
      round: 'Finals',
      segment: 'Afternoon Session',
      description: 'Classical and acoustic instrument solos.',
      display_order: 4,
      status: 'pending',
      first_place_name: null,
      first_place_details: null,
      first_place_score: null,
      second_place_name: null,
      second_place_details: null,
      second_place_score: null,
      third_place_name: null,
      third_place_details: null,
      third_place_score: null,
      notes: 'Performances conclude at 4:00 PM; results will follow.',
    },
    {
      id: 'item_seed_5',
      category: 'Theatrical Skit & One-Act Play',
      round: 'Finals',
      segment: 'Main Hall',
      description: 'Original short dramatic or comedic theatrical presentations.',
      display_order: 5,
      status: 'completed',
      first_place_name: 'The Spotlight Players',
      first_place_details: 'Play: "The Grand Illusion" • Directed by Sarah Jenkins',
      first_place_score: '97.5',
      second_place_name: 'Riverdale Drama Troupe',
      second_place_details: 'Play: "Whispers in the Library"',
      second_place_score: '95.0',
      third_place_name: 'Crestview Performers',
      third_place_details: 'Play: "A Midnight Tale"',
      third_place_score: '92.5',
      notes: 'Special commendation for costume design.',
    },
    {
      id: 'item_seed_6',
      category: 'Acoustic Band Showcase',
      round: 'Finals',
      segment: 'Outdoor Pavilion',
      description: 'Live acoustic musical ensembles with original arrangements.',
      display_order: 6,
      status: 'pending',
      first_place_name: null,
      first_place_details: null,
      first_place_score: null,
      second_place_name: null,
      second_place_details: null,
      second_place_score: null,
      third_place_name: null,
      third_place_details: null,
      third_place_score: null,
      notes: 'Final round kicks off at 5:00 PM.',
    },
  ];

  const now = new Date().toISOString();

  for (const item of initialItems) {
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
        item.round,
        item.segment,
        item.description,
        item.display_order,
        item.status,
        item.first_place_name,
        item.first_place_details,
        item.first_place_score,
        item.second_place_name,
        item.second_place_details,
        item.second_place_score,
        item.third_place_name,
        item.third_place_details,
        item.third_place_score,
        item.notes,
        now,
        now,
      ],
    });
  }

  await client.execute({
    sql: `INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('last_updated_at', ?)`,
    args: [now],
  });

  console.log(`Successfully seeded ${initialItems.length} initial competition items.`);

  // Generate public sample Excel template for users
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sampleRows = [
    {
      'Category Name': 'Western Hip-Hop Dance Solo',
      Round: 'Finals',
      Session: 'Auditorium B',
      '1st Place Winner': 'Marcus Vance',
      '1st Place Details': 'Westlake Academy • Score: 98.2',
      '1st Place Score': '98.2',
      '2nd Place Winner': 'Chloe Ramirez',
      '2nd Place Details': 'Summit High • Score: 96.5',
      '2nd Place Score': '96.5',
      '3rd Place Winner': 'Devon Brooks',
      '3rd Place Details': 'Apex School of Arts • Score: 95.0',
      '3rd Place Score': '95.0',
      'Judges Remarks': 'Outstanding choreography and stage energy',
    },
    {
      'Category Name': 'Beatboxing & Vocal Percussion',
      Round: 'Finals',
      Session: 'Evening Gala',
      '1st Place Winner': 'Tariq "Bassline" Jones',
      '1st Place Details': 'Track: "Cybernetic Beats"',
      '1st Place Score': '97.0',
      '2nd Place Winner': 'Leo Zhang',
      '2nd Place Details': 'Track: "Rhythm & Echoes"',
      '2nd Place Score': '94.8',
      '3rd Place Winner': '',
      '3rd Place Details': '',
      '3rd Place Score': '',
      'Judges Remarks': '3rd place pending tie-breaker review',
    },
    {
      'Category Name': 'Speed Painting & Live Art',
      Round: 'Finals',
      Session: 'Atrium Gallery',
      '1st Place Winner': 'Elena Rostova',
      '1st Place Details': 'Canvas: "Sunset Over Skylines" (Completed in 15 mins)',
      '1st Place Score': '99.5',
      '2nd Place Winner': 'Amara Okafor',
      '2nd Place Details': 'Canvas: "Wildlife in Motion"',
      '2nd Place Score': '97.0',
      '3rd Place Winner': 'Lucas Silva',
      '3rd Place Details': 'Canvas: "Portrait of Resilience"',
      '3rd Place Score': '96.0',
      'Judges Remarks': 'Crowd favorite and highest technical marks',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Results');
  XLSX.writeFile(wb, path.join(publicDir, 'sample_talent_show_results.xlsx'));

  console.log('Sample Excel file generated at public/sample_talent_show_results.xlsx');
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
