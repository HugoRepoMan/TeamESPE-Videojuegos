import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  projectId: 'teamespegames'
});

const db = getFirestore();

async function run() {
  try {
    const matchesRef = db.collection('matches');
    const snap = await matchesRef.get();
    const matches = snap.docs.map(d => ({id: d.id, ...d.data()}));
    const relevantMatches = matches.sort((a,b) => (a.round - b.round) || (a.bracketPosition - b.bracketPosition));
    for (const m of relevantMatches) {
      console.log(`ID: ${m.id} | Round: ${m.round} | Pos: ${m.bracketPosition} | A: ${m.playerAName} (${m.scoreA}) | B: ${m.playerBName} (${m.scoreB}) | Winner: ${m.winnerId}`);
    }
    process.exit(0);
  } catch (err) {
    console.error("Auth error:", err);
    process.exit(1);
  }
}

run();
