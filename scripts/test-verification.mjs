import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3000';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runTests() {
  console.log('====================================================');
  console.log(' RUNNING END-TO-END TALENT SHOW RESULTS VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Test Public Results Endpoint (No Auth Needed)
  console.log('Step 1: Testing Public Viewer Endpoint...');
  const publicRes = await fetch(`${BASE_URL}/api/results`);
  assert(publicRes.status === 200, 'Public /api/results returns 200 OK without authentication');
  const publicData = await publicRes.json();
  assert(publicData.success === true, 'Public /api/results returns success: true');
  assert(Array.isArray(publicData.items) && publicData.items.length > 0, `Public endpoint returned ${publicData.items?.length} items`);

  // Verify "Not announced" states on items
  const itemWithPending = publicData.items.find(i => !i.second_place_name || !i.third_place_name);
  assert(Boolean(itemWithPending), 'Items without winners correctly exist with null/blank position for "Not announced" state');

  // Verify no admin passwords or secrets are leaked
  assert(JSON.stringify(publicData).includes('ADMIN_PASSWORD') === false, 'Public data does not leak ADMIN_PASSWORD');
  assert(JSON.stringify(publicData).includes('password_hash') === false, 'Public data does not leak password_hash');

  // 2. Test Admin Endpoint Security (Must be 401 Unauthorized without cookie)
  console.log('\nStep 2: Testing Admin Security & Authorization Boundaries...');
  const unauthAdminRes = await fetch(`${BASE_URL}/api/admin/items`);
  assert(unauthAdminRes.status === 401, 'Unauthenticated request to /api/admin/items returns 401 Unauthorized');

  const unauthPostRes = await fetch(`${BASE_URL}/api/admin/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'Unauthorized Test' }),
  });
  assert(unauthPostRes.status === 401, 'Unauthenticated POST to /api/admin/items returns 401 Unauthorized');

  // 3. Test Admin Login
  console.log('\nStep 3: Testing Admin Authentication Flow...');
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'WrongPassword123' }),
  });
  assert(badLoginRes.status === 401, 'Invalid credentials return 401 Unauthorized');

  const goodLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'TalentAdmin2026!' }),
  });
  assert(goodLoginRes.status === 200, 'Valid admin credentials return 200 OK');
  const cookieHeader = goodLoginRes.headers.get('set-cookie');
  assert(cookieHeader && cookieHeader.includes('talent_admin_session'), 'Login returns secure HTTP-only session cookie');

  const sessionCookie = cookieHeader.split(';')[0];

  // 4. Test Authenticated Admin CRUD
  console.log('\nStep 4: Testing Authenticated Admin CRUD Actions...');
  const authGetRes = await fetch(`${BASE_URL}/api/admin/items`, {
    headers: { Cookie: sessionCookie },
  });
  assert(authGetRes.status === 200, 'Authenticated admin GET /api/admin/items returns 200 OK');

  // Create a new result item
  const newCategoryName = `Acrobatic Gymnastics & Aerials - ${Date.now()}`;
  const createRes = await fetch(`${BASE_URL}/api/admin/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      category: newCategoryName,
      round: 'Championship',
      segment: 'Evening Gala',
      description: 'High-flying gymnastics routines.',
      display_order: 99,
      first_place_name: 'Skyline Flyers',
      first_place_details: 'St. Jude Gymnastics • Routine: "Gravity Defiers"',
      first_place_score: '99.2',
      second_place_name: 'Aerial Dreamers',
      second_place_details: 'Routine: "Wings of Freedom"',
      second_place_score: '97.8',
      third_place_name: '', // Not announced yet
      notes: 'Finalists received standing ovation',
    }),
  });
  assert(createRes.status === 200, 'Admin can successfully create a new result item');
  const createdData = await createRes.json();
  assert(createdData.item && createdData.item.id, 'Created item has unique ID');
  const createdId = createdData.item.id;

  // Verify item is now published on public page
  const verifyPublicRes = await fetch(`${BASE_URL}/api/results`);
  const verifyPublicData = await verifyPublicRes.json();
  const publishedItem = verifyPublicData.items.find(i => i.id === createdId);
  assert(Boolean(publishedItem), 'Newly created item is immediately visible on the public viewer endpoint');
  assert(publishedItem.first_place_name === 'Skyline Flyers', '1st place winner is properly published');
  assert(publishedItem.third_place_name === null, '3rd place is null ("Not announced") on viewer');

  // Update item results (e.g. announce 3rd place!)
  const updateRes = await fetch(`${BASE_URL}/api/admin/items/${createdId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      third_place_name: 'Zephyr Acrobats',
      third_place_details: 'Routine: "Twister"',
      third_place_score: '95.5',
    }),
  });
  assert(updateRes.status === 200, 'Admin can enter/update 3rd place results');

  // Verify update on public endpoint
  const verifyUpdatedRes = await fetch(`${BASE_URL}/api/results`);
  const verifyUpdatedData = await verifyUpdatedRes.json();
  const updatedItem = verifyUpdatedData.items.find(i => i.id === createdId);
  assert(updatedItem.third_place_name === 'Zephyr Acrobats', 'Updated 3rd place immediately appears for public viewers');
  assert(updatedItem.status === 'completed', 'Item status transitions to completed once all 3 places are announced');

  // 5. Test Excel Import Flow
  console.log('\nStep 5: Testing Excel File Import & Validation Flow...');
  const sampleExcelPath = path.resolve(process.cwd(), 'public', 'sample_talent_show_results.xlsx');
  assert(fs.existsSync(sampleExcelPath), 'Sample Excel spreadsheet exists for testing');

  // Parse Excel file
  const fileBuffer = fs.readFileSync(sampleExcelPath);
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'sample.xlsx');

  const parseRes = await fetch(`${BASE_URL}/api/admin/import/parse`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
    body: formData,
  });
  assert(parseRes.status === 200, 'Excel parser endpoint returns 200 OK');
  const parseData = await parseRes.json();
  assert(parseData.headers && parseData.headers.length > 0, `Excel parser detected ${parseData.headers?.length} column headers`);
  assert(parseData.totalRows === 3, 'Detected 3 data rows in sample Excel spreadsheet');

  // Validate mapping and rows
  const validateRes = await fetch(`${BASE_URL}/api/admin/import/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      rows: parseData.allRows,
      mapping: {
        category: 'Category Name',
        round: 'Round',
        segment: 'Session',
        first_place_name: '1st Place Winner',
        first_place_details: '1st Place Details',
        first_place_score: '1st Place Score',
        second_place_name: '2nd Place Winner',
        second_place_details: '2nd Place Details',
        second_place_score: '2nd Place Score',
        third_place_name: '3rd Place Winner',
        third_place_details: '3rd Place Details',
        third_place_score: '3rd Place Score',
        notes: 'Judges Remarks',
      },
    }),
  });
  assert(validateRes.status === 200, 'Excel validation step returns 200 OK');
  const validateData = await validateRes.json();
  assert(validateData.summary && validateData.summary.validRows > 0, `Validated ${validateData.summary?.validRows} rows ready for import`);

  // Execute Import
  const executeRes = await fetch(`${BASE_URL}/api/admin/import/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      items: validateData.summary.preview,
      overwriteStrategy: 'fill_blank_only',
    }),
  });
  assert(executeRes.status === 200, 'Excel import execution returns 200 OK');
  const executeData = await executeRes.json();
  assert(executeData.insertedCount > 0, `Excel import successfully inserted ${executeData.insertedCount} new categories`);

  // Verify imported categories appear on public site
  const finalPublicRes = await fetch(`${BASE_URL}/api/results`);
  const finalPublicData = await finalPublicRes.json();
  const importedDance = finalPublicData.items.find(i => i.category === 'Western Hip-Hop Dance Solo');
  assert(Boolean(importedDance), 'Imported category "Western Hip-Hop Dance Solo" is live on the public viewer page');
  assert(importedDance.first_place_name === 'Marcus Vance', 'Imported 1st place winner "Marcus Vance" is accurately displayed');
  assert(importedDance.second_place_name === 'Chloe Ramirez', 'Imported 2nd place winner "Chloe Ramirez" is accurately displayed');
  assert(importedDance.third_place_name === 'Devon Brooks', 'Imported 3rd place winner "Devon Brooks" is accurately displayed');

  // Clean up created item
  await fetch(`${BASE_URL}/api/admin/items/${createdId}`, {
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
  });

  console.log('\n====================================================');
  console.log(` VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
