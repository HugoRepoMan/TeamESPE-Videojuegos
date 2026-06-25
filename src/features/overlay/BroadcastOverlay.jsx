import { useState, useEffect } from 'react';
import { subscribeToOverlay } from '../../firebase/services';
import { Swords } from 'lucide-react';

const SEED_OVERLAY = {
  activeMatchId: 'demo',
  disciplineName: 'League of Legends',
  playerAName: 'Equipo Alpha',
  playerBName: 'Equipo Beta',
  playerAScore: 1,
  playerBScore: 0,
  status: 'live',
};

export default function BroadcastOverlay() {
  const [overlayData, setOverlayData] = useState(SEED_OVERLAY);
  
  // Extract bg param from URL (e.g. ?bg=green)
  const urlParams = new URLSearchParams(window.location.search);
  const bgColor = urlParams.get('bg') || 'transparent';

  useEffect(() => {
    // Attempt to subscribe to Firebase RTDB
    // If it fails or returns null, we stick to SEED_OVERLAY
    const unsubscribe = subscribeToOverlay((data) => {
      if (data) {
        setOverlayData(data);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Format status text
  const getStatusText = (status) => {
    switch(status) {
      case 'scheduled': return 'PRÓXIMO';
      case 'live': return 'EN VIVO';
      case 'finished': return 'FINALIZADO';
      case 'walkover': return 'W.O.';
      default: return '';
    }
  };

  return (
    <div 
      className="w-[1920px] h-[1080px] overflow-hidden relative font-sans text-white"
      style={{ backgroundColor: bgColor === 'green' ? '#00FF00' : bgColor }}
    >
      {/* Top HUD Bar */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center justify-center">
        {/* Player A */}
        <div className="w-[400px] h-[80px] bg-hud-bg/90 border-t-2 border-b-2 border-l-2 border-hud-accent clip-diagonal-reverse flex items-center justify-end px-8 backdrop-blur-sm shadow-[0_0_15px_rgba(227,0,43,0.3)]">
          <h2 className="text-3xl font-bold tracking-wider truncate">{overlayData.playerAName}</h2>
        </div>

        {/* Score Center */}
        <div className="w-[250px] h-[100px] bg-hud-surface border-2 border-hud-accent clip-diagonal-both flex flex-col items-center justify-center z-10 mx-[-20px] shadow-[0_0_20px_rgba(227,0,43,0.5)]">
          <div className="text-xs text-hud-accent font-bold tracking-widest mb-1">
            {overlayData.disciplineName.toUpperCase()}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black">{overlayData.playerAScore}</span>
            <Swords className="w-6 h-6 text-hud-text-secondary" />
            <span className="text-4xl font-black">{overlayData.playerBScore}</span>
          </div>
        </div>

        {/* Player B */}
        <div className="w-[400px] h-[80px] bg-hud-bg/90 border-t-2 border-b-2 border-r-2 border-hud-accent clip-diagonal flex items-center justify-start px-8 backdrop-blur-sm shadow-[0_0_15px_rgba(227,0,43,0.3)]">
          <h2 className="text-3xl font-bold tracking-wider truncate">{overlayData.playerBName}</h2>
        </div>
      </div>

      {/* Status Indicator (if not live) */}
      {overlayData.status !== 'live' && (
        <div className="absolute top-[140px] left-1/2 -translate-x-1/2 bg-hud-bg px-6 py-1 border border-hud-border text-sm font-bold tracking-widest uppercase">
          {getStatusText(overlayData.status)}
        </div>
      )}

      {/* Optional: Add a "Torneo ESPE Gaming" watermark in bottom corner */}
      <div className="absolute bottom-8 right-8 flex items-center gap-3 opacity-50">
        <div className="w-2 h-12 bg-hud-accent"></div>
        <div>
          <div className="text-xl font-black tracking-widest leading-none">TORNEO ESPE</div>
          <div className="text-sm font-bold text-hud-text-secondary tracking-widest">GAMING SERIES</div>
        </div>
      </div>
    </div>
  );
}
