import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCgSsDx9LYl5ayXbd8ESUdnQYcsPX66xJE",
  authDomain: "teamespegames.firebaseapp.com",
  projectId: "teamespegames",
  storageBucket: "teamespegames.firebasestorage.app",
  messagingSenderId: "223111677867",
  appId: "1:223111677867:web:dcaf5954ac9b650162b4ee",
  databaseURL: "https://teamespegames-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'matches'));
  const matches = snap.docs.map(d => ({id: d.id, ...d.data()}));
  
  const relevantMatches = matches.sort((a,b) => (a.round - b.round) || (a.bracketPosition - b.bracketPosition));
  for (const m of relevantMatches) {
    console.log(`ID: ${m.id} | Round: ${m.round} | Pos: ${m.bracketPosition} | A: ${m.playerAName} (${m.scoreA}) | B: ${m.playerBName} (${m.scoreB}) | Winner: ${m.winnerId}`);
  }
  process.exit(0);
}

run().catch(console.error);
