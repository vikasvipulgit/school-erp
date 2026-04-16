import { initializeApp } from 'firebase/app'
import { getFirestore, collection, 
         addDoc, serverTimestamp } from 'firebase/firestore'
import seedData from './firestore-seed.json' assert { type: 'json' }

// Paste your firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyB0QAZMBgM3j0k4RjCrpU9eepLXBWFeOwM",
  authDomain: "school-erp-6b4b4.firebaseapp.com",
  projectId: "school-erp-6b4b4",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function seedCollection(collectionName, documents) {
  console.log(`Seeding ${collectionName}...`)
  for (const doc of documents) {
    await addDoc(collection(db, collectionName), {
      ...doc,
      createdAt: serverTimestamp()
    })
  }
  console.log(`✅ ${collectionName} done — 
    ${documents.length} documents added`)
}

async function seed() {
  try {
    for (const [collectionName, documents] of 
         Object.entries(seedData)) {
      await seedCollection(collectionName, documents)
    }
    console.log('🎉 All collections seeded successfully!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  }
}

seed()