/**
 * Creates principal and teacher Firebase Auth users + Firestore profiles.
 * Run: node seed-users.mjs
 */

const API_KEY = 'AIzaSyB0QAZMBgM3j0k4RjCrpU9eepLXBWFeOwM';
const PROJECT_ID = 'school-erp-6b4b4';

const USERS = [
  {
    name: 'Principal User',
    email: 'principal@school.com',
    password: 'school@123',
    role: 'principal',
  },
  {
    name: 'Teacher User',
    email: 'teacher@school.com',
    password: 'school@123',
    role: 'teacher',
  },
];

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
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, displayName, returnSecureToken: false }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
}

async function writeFirestoreDoc(uid, payload) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const fields = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (typeof v === 'number') fields[k] = { integerValue: String(v) };
  }
  fields.createdAt = { timestampValue: new Date().toISOString() };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
}

async function main() {
  for (const u of USERS) {
    process.stdout.write(`Creating ${u.role}: ${u.email} ... `);
    try {
      const { uid, idToken } = await createAuthUser(u.email, u.password);
      await setDisplayName(idToken, u.name);
      await writeFirestoreDoc(uid, { uid, name: u.name, email: u.email, role: u.role });
      console.log(`✅  uid=${uid}`);
    } catch (err) {
      if (err.message === 'EMAIL_EXISTS') {
        console.log('⚠️  already exists, skipping');
      } else {
        console.error(`❌  ${err.message}`);
      }
    }
  }
  console.log('\nDone. Login credentials:');
  USERS.forEach((u) => console.log(`  ${u.role.padEnd(12)} ${u.email}  /  ${u.password}`));
}

main();
