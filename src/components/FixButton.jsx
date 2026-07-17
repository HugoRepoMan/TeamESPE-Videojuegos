import { useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/client';

export default function FixButton() {
  const [loading, setLoading] = useState(false);

  const fixMatches = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'matches'));
      const matches = snap.docs.map(d => ({id: d.id, ...d.data()}));
      
      // We need to fix the matches where "Dragneel54" played "luke anderson"
      // Looking at the image:
      // Partida 12 (Round 2): Dragneel54 (0) vs luke anderson (2) -> Winner: luke anderson
      // Partida 14 (Round 3): Elianxd (0) vs luke anderson (2) -> Winner: luke anderson
      // Partida 15 (Final): #QPL8CCP98 vs luke anderson
      
      const p12 = matches.find(m => m.round === 2 && (m.playerAName === 'Dragneel54' || m.playerBName === 'Dragneel54') && (m.playerAName === 'luke anderson' || m.playerBName === 'luke anderson'));
      if (p12) {
        // Change score so Dragneel54 wins 2-0
        const dragneelIsA = p12.playerAName === 'Dragneel54';
        const dragneelId = dragneelIsA ? p12.playerAId : p12.playerBId;
        await updateDoc(doc(db, 'matches', p12.id), {
          scoreA: dragneelIsA ? 2 : 0,
          scoreB: dragneelIsA ? 0 : 2,
          winnerId: dragneelId
        });
        
        // Find Partida 14 (Round 3) which has luke anderson
        const p14 = matches.find(m => m.round === 3 && (m.playerAName === 'luke anderson' || m.playerBName === 'luke anderson'));
        if (p14) {
          const lukeIsA_14 = p14.playerAName === 'luke anderson';
          await updateDoc(doc(db, 'matches', p14.id), {
            [lukeIsA_14 ? 'playerAName' : 'playerBName']: 'Dragneel54',
            [lukeIsA_14 ? 'playerAId' : 'playerBId']: dragneelId,
            scoreA: lukeIsA_14 ? 2 : 0, // Dragneel54 wins
            scoreB: lukeIsA_14 ? 0 : 2,
            winnerId: dragneelId
          });
          
          // Find Partida 15 (Round 4 / Final)
          const p15 = matches.find(m => m.round === 4 && (m.playerAName === 'luke anderson' || m.playerBName === 'luke anderson'));
          if (p15) {
            const lukeIsA_15 = p15.playerAName === 'luke anderson';
            await updateDoc(doc(db, 'matches', p15.id), {
              [lukeIsA_15 ? 'playerAName' : 'playerBName']: 'Dragneel54',
              [lukeIsA_15 ? 'playerAId' : 'playerBId']: dragneelId,
              scoreA: 0,
              scoreB: 0,
              winnerId: null,
              status: 'pending'
            });
            alert("Bracket corregido exitosamente!");
          }
        }
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={fixMatches}
      disabled={loading}
      className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white p-4 rounded"
    >
      {loading ? 'Corrigiendo...' : 'FIX BRACKET ERROR'}
    </button>
  );
}
