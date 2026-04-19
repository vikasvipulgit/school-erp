/**
 * Creates Firebase Auth + Firestore accounts for all 34 teachers.
 * Also writes credentials to ../../teacher_credentials.txt
 * Run: node seed-teachers.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { requireEnv } from './loadFirebaseEnv.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const API_KEY = requireEnv('VITE_FIREBASE_API_KEY');
const PROJECT_ID = requireEnv('VITE_FIREBASE_PROJECT_ID');
const PASSWORD   = 'Teacher@123';

const teachers = JSON.parse(
  readFileSync(join(__dir, 'src/data/teachers.json'), 'utf8')
);

function nameToEmail(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z.]/g, '') + '@school.com';
}

async function createAuthUser(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return { uid: data.localId, idToken: data.idToken };
}

async function setDisplayName(idToken, displayName) {
  await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, displayName, returnSecureToken: false }),
    }
  );
}

async function writeFirestoreDoc(uid, fields) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const fsFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) {
      fsFields[k] = { arrayValue: { values: v.map(s => ({ stringValue: s })) } };
    } else if (typeof v === 'string') {
      fsFields[k] = { stringValue: v };
    }
  }
  fsFields.createdAt = { timestampValue: new Date().toISOString() };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fsFields }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const results = [];
  const skipped = [];

  for (const t of teachers) {
    const email = nameToEmail(t.name);
    process.stdout.write(`[${t.id}] ${t.name.padEnd(22)} → ${email} ... `);
    try {
      const { uid, idToken } = await createAuthUser(email, PASSWORD);
      await setDisplayName(idToken, t.name);
      await writeFirestoreDoc(uid, {
        uid,
        name: t.name,
        email,
        role: 'teacher',
        teacherId: t.id,
        subject: t.subject,
        classes: t.classes,
      });
      console.log(`✅`);
      results.push({ ...t, email, uid });
    } catch (err) {
      if (err.message === 'EMAIL_EXISTS') {
        console.log('⚠️  exists');
        skipped.push({ ...t, email });
      } else {
        console.error(`❌  ${err.message}`);
      }
    }
    await sleep(150); // avoid rate-limit
  }

  // Write credentials file to project root
  const lines = [
    '='.repeat(72),
    'SCHOOL ERP — TEACHER LOGIN CREDENTIALS',
    `Generated: ${new Date().toLocaleString()}`,
    `Password for all teachers: ${PASSWORD}`,
    '='.repeat(72),
    '',
    `${'ID'.padEnd(8)}${'Name'.padEnd(26)}${'Email'.padEnd(36)}${'Subject'.padEnd(22)}Classes`,
    '-'.repeat(120),
    ...results.map(t =>
      `${t.id.padEnd(8)}${t.name.padEnd(26)}${t.email.padEnd(36)}${t.subject.padEnd(22)}${t.classes.join(', ')}`
    ),
    ...(skipped.length ? [
      '',
      'Already existed (not re-created):',
      ...skipped.map(t => `  ${t.id}  ${t.name}  ${t.email}`),
    ] : []),
    '',
    '='.repeat(72),
    'Admin / Staff Credentials',
    '='.repeat(72),
    'admin        user@school.com           (existing)',
    'principal    principal@school.com      school@123',
    'teacher-demo teacher@school.com        school@123',
  ];

  const outPath = join(__dir, '../../teacher_credentials.txt');
  writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`\n✅ Credentials written to: ${outPath}`);
  console.log(`   Created: ${results.length}  |  Skipped: ${skipped.length}`);
}

main();
