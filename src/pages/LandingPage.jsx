import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Calendar, Shield, ChevronRight, ChevronDown, Swords, Users, DollarSign, Clock, Target, Zap, Timer, LogOut, User } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';
import HudCard from '../components/ui/HudCard';
import GameBadge from '../components/ui/GameBadge';
import SectionTitle from '../components/ui/SectionTitle';
import DiagonalButton from '../components/ui/DiagonalButton';

const DISCIPLINES = [
  { id: 'clash-royale', name: 'Clash Royale', mode: '1v1', slug: 'clash-royale' },
  { id: 'fortnite', name: 'Fortnite', mode: '1v1', slug: 'fortnite' },
  { id: 'minecraft', name: 'Minecraft', mode: '1v1', slug: 'minecraft' },
  { id: 'league-of-legends', name: 'League of Legends', mode: '5v5 / 1v1', slug: 'league-of-legends' },
  { id: 'dragon-ball', name: 'Dragon Ball Sparking Zero', mode: '1v1', slug: 'dragon-ball' },
  { id: 'fifa-26', name: 'FIFA 26', mode: '1v1', slug: 'fifa-26' },
  { id: 'mortal-kombat', name: 'Mortal Kombat', mode: '1v1', slug: 'mortal-kombat' },
];

const SCHEDULE = [
  { 
    day: 'Auditorio Principal', 
    date: '17 Jul 2026 • 09:00 - 16:00', 
    events: ['Gran Final League of Legends', 'Finales de Consolas', 'Premiación'] 
  },
  { 
    day: 'Laboratorio de Cómputo', 
    date: '17 Jul 2026 • 09:00 - 16:00', 
    events: ['Clasificatorias League of Legends', 'Torneo de Minecraft', 'Fortnite'] 
  },
  { 
    day: 'Zona Móvil / Hall', 
    date: '17 Jul 2026 • 09:00 - 16:00', 
    events: ['Torneo Clash Royale', 'Mortal Kombat', 'FIFA 26', 'Dragon Ball'] 
  },
];

const GAME_COLORS = {
  'clash-royale': '#f59e0b',
  'fortnite': '#8b5cf6',
  'minecraft': '#22c55e',
  'league-of-legends': '#3b82f6',
  'dragon-ball': '#f97316',
  'fifa-26': '#06b6d4',
  'mortal-kombat': '#ef4444',
};

const RULES = [
  {
    title: 'Inscripción y Pago',
    content: 'El costo de inscripción es de $2.00 por disciplina. El pago debe realizarse mediante transferencia bancaria y subir el comprobante a la plataforma. La inscripción será validada por un administrador antes de confirmar tu participación.',
  },
  {
    title: 'Formato de Competencia',
    content: 'Todas las disciplinas se jugarán en formato de eliminación directa (bracket). Las partidas serán al mejor de 3 (Bo3) excepto las finales que serán al mejor de 5 (Bo5). Los brackets se generarán automáticamente una vez cerradas las inscripciones.',
  },
  {
    title: 'Política de W.O. (Walkover)',
    content: 'Si un jugador no se presenta dentro de los 10 minutos posteriores a la hora programada de su partida, se le otorgará W.O. automático a su oponente. No se permiten reprogramaciones fuera de los horarios establecidos.',
  },
  {
    title: 'Conducta y Fair Play',
    content: 'Se espera un comportamiento respetuoso entre todos los participantes. El uso de trampas, exploits o software no autorizado resultará en descalificación inmediata. Las decisiones de los administradores son definitivas.',
  },
  {
    title: 'Comunicación',
    content: 'Toda la comunicación oficial se realizará a través de la plataforma y el grupo oficial del torneo. Los horarios de partidas se publicarán con al menos 24 horas de anticipación.',
  },
];

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // 17 de Julio de 2026 a las 09:00:00
    const targetDate = new Date('2026-07-17T09:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4 mb-10">
      <div className="flex flex-col items-center justify-center bg-hud-surface border border-hud-accent/50 w-20 h-24 clip-diagonal shadow-[0_0_15px_rgba(227,0,43,0.2)]">
        <span className="text-3xl font-black text-hud-text">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase text-hud-text-secondary tracking-widest mt-1">Días</span>
      </div>
      <div className="text-2xl font-black text-hud-accent animate-pulse">:</div>
      <div className="flex flex-col items-center justify-center bg-hud-surface border border-hud-accent/50 w-20 h-24 clip-diagonal shadow-[0_0_15px_rgba(227,0,43,0.2)]">
        <span className="text-3xl font-black text-hud-text">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase text-hud-text-secondary tracking-widest mt-1">Horas</span>
      </div>
      <div className="text-2xl font-black text-hud-accent animate-pulse">:</div>
      <div className="flex flex-col items-center justify-center bg-hud-surface border border-hud-accent/50 w-20 h-24 clip-diagonal shadow-[0_0_15px_rgba(227,0,43,0.2)]">
        <span className="text-3xl font-black text-hud-text">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase text-hud-text-secondary tracking-widest mt-1">Min</span>
      </div>
      <div className="text-2xl font-black text-hud-accent animate-pulse">:</div>
      <div className="flex flex-col items-center justify-center bg-hud-surface border border-hud-accent/50 w-20 h-24 clip-diagonal shadow-[0_0_15px_rgba(227,0,43,0.2)]">
        <span className="text-3xl font-black text-hud-gold">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase text-hud-gold tracking-widest mt-1">Seg</span>
      </div>
    </div>
  );
}

function RuleAccordion({ title, content, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-hud-border bg-hud-surface">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-hud-bg/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-hud-accent">{String(index + 1).padStart(2, '0')}</span>
          <span className="font-bold text-sm uppercase tracking-wider">{title}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-hud-text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0 border-t border-hud-border">
          <p className="text-sm text-hud-text-secondary leading-relaxed mt-3">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-hud-bg">

      {/* ====================== NAV BAR ====================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-hud-bg/90 backdrop-blur-sm border-b border-hud-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 size={24} className="text-hud-accent" />
            <span className="text-lg font-bold uppercase tracking-widest">ESPE Gaming</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-semibold uppercase tracking-wider text-hud-text-secondary">
            <a href="#disciplines" className="hover:text-hud-accent transition-colors">Disciplinas</a>
            <a href="#schedule" className="hover:text-hud-accent transition-colors">Cronograma</a>
            <a href="#rules" className="hover:text-hud-accent transition-colors">Reglas</a>
            <Link to="/brackets" className="hover:text-hud-accent transition-colors text-hud-gold">Ver Llaves</Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : "/dashboard"}>
                  <DiagonalButton className="!px-4 !py-2 text-xs flex items-center gap-2">
                    <User size={14} />
                    Mi Panel
                  </DiagonalButton>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-hud-text-secondary hover:text-hud-error transition-colors p-2"
                  title="Cerrar Sesion"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold uppercase tracking-wider text-hud-text-secondary hover:text-hud-accent transition-colors"
                >
                  Ingresar
                </Link>
                <Link to="/register">
                  <DiagonalButton>Registro</DiagonalButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ====================== HERO SECTION ====================== */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner accents */}
          <div className="absolute top-20 left-0 w-32 h-px bg-gradient-to-r from-hud-accent to-transparent" />
          <div className="absolute top-20 left-0 w-px h-32 bg-gradient-to-b from-hud-accent to-transparent" />
          <div className="absolute bottom-0 right-0 w-48 h-px bg-gradient-to-l from-hud-accent to-transparent" />
          <div className="absolute bottom-0 right-0 w-px h-48 bg-gradient-to-t from-hud-accent to-transparent" />

          {/* Scan lines */}
          <div className="absolute top-1/4 left-8 w-px h-64 bg-hud-accent/10 animate-scan" />
          <div className="absolute top-1/3 right-12 w-px h-48 bg-hud-accent/10 animate-scan" />
          <div className="absolute top-2/3 left-1/4 w-64 h-px bg-hud-accent/5" />
          <div className="absolute top-1/2 right-1/4 w-48 h-px bg-hud-accent/5" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(227,0,43,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(227,0,43,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8">
          {/* Top decorative line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-hud-accent" />
            <Timer size={20} className="text-hud-gold" />
            <div className="h-px w-16 bg-hud-accent" />
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none mb-6">
            <span className="text-hud-text">Torneo</span>
            <br />
            <span className="text-hud-accent">ESPE Gaming</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-hud-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
            Un solo día. 7 disciplinas. Un solo campeón.
            El torneo interuniversitario más grande de Santo Domingo.
          </p>

          {/* Date badge & Timer */}
          <div className="inline-flex items-center gap-2 bg-hud-surface border border-hud-border px-4 py-2 mb-6 text-sm">
            <Calendar size={16} className="text-hud-gold" />
            <span className="text-hud-text-secondary font-semibold uppercase tracking-wider">17 DE JULIO, 2026 • 09:00 AM</span>
          </div>

          <CountdownTimer />

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <DiagonalButton className="text-base px-10 py-4 flex items-center gap-2">
                Inscríbete Ahora
                <ChevronRight size={18} />
              </DiagonalButton>
            </Link>
            <Link to="/brackets">
              <DiagonalButton variant="secondary" className="text-base px-10 py-4 flex items-center gap-2 border-hud-gold text-hud-gold hover:bg-hud-gold/10">
                Ver Llaves en Vivo
                <Trophy size={18} />
              </DiagonalButton>
            </Link>
            <a href="#disciplines">
              <DiagonalButton variant="secondary" className="text-base px-10 py-4 flex items-center gap-2">
                Ver Disciplinas
                <Swords size={18} />
              </DiagonalButton>
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-hud-accent">7</div>
              <div className="text-xs uppercase tracking-wider text-hud-text-secondary mt-1">Disciplinas</div>
            </div>
            <div className="text-center border-x border-hud-border">
              <div className="text-2xl sm:text-3xl font-black text-hud-gold">$2</div>
              <div className="text-xs uppercase tracking-wider text-hud-text-secondary mt-1">Inscripción</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-hud-accent">1</div>
              <div className="text-xs uppercase tracking-wider text-hud-text-secondary mt-1">Solo Día</div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-hud-bg to-transparent" />
      </section>

      {/* ====================== DISCIPLINES SECTION ====================== */}
      <section id="disciplines" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionTitle className="justify-center">Disciplinas</SectionTitle>
            <p className="text-hud-text-secondary mt-4 max-w-xl mx-auto">
              Compite en 7 juegos diferentes. Elige tu disciplina y demuestra quién es el mejor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {DISCIPLINES.map((game) => (
              <HudCard key={game.id} clip="diagonal" className="group hover:border-hud-accent/40 transition-colors relative overflow-hidden">
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: GAME_COLORS[game.slug] }}
                />

                <div className="flex flex-col gap-4">
                  {/* Game badge */}
                  <GameBadge name={game.name} slug={game.slug} />

                  {/* Game info */}
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-2 text-sm text-hud-text-secondary">
                      <Users size={14} />
                      <span>Modo: <span className="text-hud-text font-semibold">{game.mode}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-hud-text-secondary">
                      <DollarSign size={14} />
                      <span>Inscripción: <span className="text-hud-gold font-semibold">$2.00</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-hud-text-secondary">
                      <Target size={14} />
                      <span>Formato: <span className="text-hud-text font-semibold">Eliminación directa</span></span>
                    </div>
                  </div>

                  {/* Action */}
                  <Link
                    to="/register"
                    className="mt-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-hud-accent hover:text-hud-accent-hover transition-colors"
                  >
                    Inscribirme
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </HudCard>
            ))}

            {/* Summary card */}
            <HudCard variant="accent" clip="diagonal" className="flex flex-col items-center justify-center text-center">
              <Zap size={32} className="text-hud-accent mb-3" />
              <p className="text-lg font-bold uppercase tracking-wider mb-2">Todas las Disciplinas</p>
              <p className="text-sm text-hud-text-secondary mb-4">
                Inscríbete en múltiples juegos y multiplica tus posibilidades de ganar.
              </p>
              <Link to="/register">
                <DiagonalButton>Registrarse</DiagonalButton>
              </Link>
            </HudCard>
          </div>
        </div>
      </section>

      {/* ====================== SCHEDULE SECTION ====================== */}
      <section id="schedule" className="relative py-24 bg-hud-surface/30">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hud-border to-transparent" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionTitle className="justify-center">Cronograma General</SectionTitle>
            <p className="text-hud-text-secondary mt-4 max-w-xl mx-auto">
              Todas las competencias se llevarán a cabo de manera simultánea el 17 de Julio en el Campus Santo Domingo.
            </p>
          </div>

          {/* Timeline / Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {SCHEDULE.map((block, idx) => (
              <HudCard key={idx} clip="diagonal" className="relative flex flex-col h-full">
                {/* Location header */}
                <div className="mb-4 pb-4 border-b border-hud-border">
                  <h3 className="text-lg font-black uppercase tracking-wider text-hud-text mb-2">
                    {block.day}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-hud-text-secondary">
                    <Clock size={14} className="text-hud-gold" />
                    <span className="font-semibold">{block.date}</span>
                  </div>
                </div>

                {/* Events */}
                <div className="space-y-3 flex-1">
                  {block.events.map((event, eventIdx) => (
                    <div
                      key={eventIdx}
                      className="flex items-center gap-3 px-3 py-2 bg-hud-bg/50 border-l-2 border-hud-accent/40"
                    >
                      <span className="text-xs font-mono text-hud-accent">{String(eventIdx + 1).padStart(2, '0')}</span>
                      <span className="text-sm font-semibold text-hud-text">{event}</span>
                    </div>
                  ))}
                </div>
              </HudCard>
            ))}
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hud-border to-transparent" />
      </section>

      {/* ====================== RULES SECTION ====================== */}
      <section id="rules" className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionTitle className="justify-center">Reglamento</SectionTitle>
            <p className="text-hud-text-secondary mt-4 max-w-xl mx-auto">
              Lee atentamente las reglas del torneo antes de inscribirte.
              La participación implica la aceptación del reglamento.
            </p>
          </div>

          {/* Shield icon decoration */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-hud-surface border border-hud-border rounded-full">
              <Shield size={28} className="text-hud-accent" />
            </div>
          </div>

          {/* Accordion rules */}
          <div className="space-y-2">
            {RULES.map((rule, idx) => (
              <RuleAccordion key={idx} title={rule.title} content={rule.content} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ====================== CTA SECTION ====================== */}
      <section className="relative py-24 overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hud-accent to-transparent" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-hud-accent/5" />
          <div className="absolute top-1/4 left-10 w-px h-32 bg-hud-accent/10 animate-scan" />
          <div className="absolute bottom-1/4 right-10 w-px h-32 bg-hud-accent/10 animate-scan" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Trophy size={32} className="text-hud-gold" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-6">
            <span className="text-hud-text">Prepárate para</span>
            <br />
            <span className="text-hud-accent">la competencia</span>
          </h2>

          <p className="text-lg text-hud-text-secondary mb-10 max-w-xl mx-auto leading-relaxed">
            No te quedes fuera. Regístrate ahora, elige tus disciplinas y demuestra que eres
            el mejor jugador de la ESPE.
          </p>

          <Link to="/register">
            <DiagonalButton className="text-lg px-12 py-5 inline-flex items-center gap-3">
              Inscríbete Ahora
              <ChevronRight size={20} />
            </DiagonalButton>
          </Link>

          {/* Bottom decorative elements */}
          <div className="mt-16 flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-hud-border" />
            <Gamepad2 size={16} className="text-hud-text-secondary" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-hud-border" />
          </div>
        </div>
      </section>

      {/* ====================== FOOTER ====================== */}
      <footer className="border-t border-hud-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 size={18} className="text-hud-accent" />
              <span className="text-sm font-bold uppercase tracking-wider text-hud-text-secondary">
                ESPE Gaming 2026
              </span>
            </div>
            <p className="text-xs text-hud-text-secondary">
              Torneo organizado por estudiantes de la ESPE Santo Domingo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
