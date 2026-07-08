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
    day: 'Laboratorio 1', 
    date: '17 Jul 2026 • Horarios por confirmar', 
    events: [
      'Gran Final League of Legends',
      'Clasificatorias League of Legends',
      'Torneo de Minecraft',
      'Torneo Clash Royale',
      'Fortnite',
      'Dragon Ball Sparking Zero',
      'FIFA 26',
      'Mortal Kombat'
    ] 
  }
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
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
      <div className="flex flex-col items-center justify-center bg-hud-surface border border-hud-accent/50 w-16 sm:w-20 h-20 sm:h-24 clip-diagonal shadow-[0_0_15px_rgba(227,0,43,0.2)]">
        <span className="text-2xl sm:text-3xl font-black text-hud-text">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[8px] sm:text-[10px] uppercase text-hud-text-secondary tracking-widest mt-1">Días</span>
      </div>
      <div className="text-xl sm:text-2xl font-black text-hud-accent animate-pulse">:</div>
      <div className="flex flex-col items-center justify-center bg-hud-surface border border-hud-accent/50 w-16 sm:w-20 h-20 sm:h-24 clip-diagonal shadow-[0_0_15px_rgba(227,0,43,0.2)]">
        <span className="text-2xl sm:text-3xl font-black text-hud-text">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[8px] sm:text-[10px] uppercase text-hud-text-secondary tracking-widest mt-1">Horas</span>
      </div>
      <div className="text-xl sm:text-2xl font-black text-hud-accent animate-pulse">:</div>
      <div className="flex flex-col items-center justify-center bg-hud-surface border border-hud-accent/50 w-16 sm:w-20 h-20 sm:h-24 clip-diagonal shadow-[0_0_15px_rgba(227,0,43,0.2)]">
        <span className="text-2xl sm:text-3xl font-black text-hud-text">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[8px] sm:text-[10px] uppercase text-hud-text-secondary tracking-widest mt-1">Min</span>
      </div>
      <div className="text-xl sm:text-2xl font-black text-hud-accent animate-pulse">:</div>
      <div className="flex flex-col items-center justify-center bg-hud-surface border border-hud-accent/50 w-16 sm:w-20 h-20 sm:h-24 clip-diagonal shadow-[0_0_15px_rgba(227,0,43,0.2)]">
        <span className="text-2xl sm:text-3xl font-black text-hud-gold">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[8px] sm:text-[10px] uppercase text-hud-gold tracking-widest mt-1">Seg</span>
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
  const { user, isAdmin, isJuez, logout } = useAuth();

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-hud-bg">

      {/* ====================== NAV BAR ====================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-hud-bg/90 backdrop-blur-sm border-b border-hud-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 size={24} className="text-hud-accent" />
            <span className="text-lg font-bold uppercase tracking-widest">ESPE Gaming</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
            <button onClick={(e) => scrollToSection(e, 'disciplines')} className="hover:text-hud-accent transition-colors uppercase cursor-pointer">Disciplinas</button>
            <button onClick={(e) => scrollToSection(e, 'schedule')} className="hover:text-hud-accent transition-colors uppercase cursor-pointer">Cronograma</button>
            <button onClick={(e) => scrollToSection(e, 'rules')} className="hover:text-hud-accent transition-colors uppercase cursor-pointer">Reglas</button>
            <Link to="/brackets" className="hover:text-hud-accent transition-colors text-hud-gold">Ver Llaves</Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : isJuez ? "/juez" : "/dashboard"}>
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
                  className="text-hud-text-secondary hover:text-hud-text transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Ingresar
                </Link>
                <Link to="/register">
                  <DiagonalButton className="!px-4 !py-2 text-xs">
                    Inscribirse
                  </DiagonalButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ====================== HERO SECTION ====================== */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hud-accent/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hud-gold/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e3002b_1px,transparent_1px),linear-gradient(to_bottom,#e3002b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.03]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-hud-surface/50 border border-hud-accent/30 px-4 py-2 mb-8 backdrop-blur-sm shadow-[0_0_10px_rgba(227,0,43,0.2)]">
            <span className="w-2 h-2 bg-hud-accent rounded-full animate-pulse" />
            <span className="text-hud-accent font-bold text-xs uppercase tracking-[0.2em]">Inscripciones Abiertas</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-6 leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 block mb-2">Primer</span>
            <span className="text-hud-text">Torneo</span>
            <br />
            <span className="text-hud-accent">ESPE Gaming</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-hud-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
            Un solo día. 7 disciplinas. Un campeón por videojuego.
            El torneo interuniversitario más grande de Santo Domingo.
          </p>

          <CountdownTimer />

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to={isAdmin ? "/admin" : isJuez ? "/juez" : "/dashboard"}>
                <DiagonalButton className="text-base px-10 py-4 flex items-center gap-2">
                  Ir al Panel
                  <ChevronRight size={18} />
                </DiagonalButton>
              </Link>
            ) : (
              <Link to="/register">
                <DiagonalButton className="text-base px-10 py-4 flex items-center gap-2">
                  Inscríbete Ahora
                  <ChevronRight size={18} />
                </DiagonalButton>
              </Link>
            )}
            <Link to="/brackets">
              <DiagonalButton variant="secondary" className="text-base px-10 py-4 flex items-center gap-2 border-hud-gold text-hud-gold hover:bg-hud-gold/10">
                Ver Llaves en Vivo
                <Trophy size={18} />
              </DiagonalButton>
            </Link>
            <button onClick={(e) => scrollToSection(e, 'disciplines')} className="cursor-pointer">
              <DiagonalButton variant="secondary" className="text-base px-10 py-4 flex items-center gap-2">
                Ver Disciplinas
                <Swords size={18} />
              </DiagonalButton>
            </button>
          </div>

          {/* Stats bar */}
          <div className="mt-20 pt-10 border-t border-hud-border grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-black text-hud-text">7</div>
              <div className="text-xs text-hud-text-secondary uppercase tracking-widest mt-1">Disciplinas</div>
            </div>
            <div>
              <div className="text-3xl font-black text-hud-text">$2</div>
              <div className="text-xs text-hud-text-secondary uppercase tracking-widest mt-1">Inscripción</div>
            </div>
            <div>
              <div className="text-3xl font-black text-hud-text">1 Día</div>
              <div className="text-xs text-hud-text-secondary uppercase tracking-widest mt-1">De Competencia</div>
            </div>
            <div>
              <div className="text-3xl font-black text-hud-text">Premios</div>
              <div className="text-xs text-hud-text-secondary uppercase tracking-widest mt-1">En Efectivo</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== GAMES SECTION ====================== */}
      <section id="disciplines" className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <SectionTitle>Disciplinas Oficiales</SectionTitle>
              <p className="text-hud-text-secondary mt-2 max-w-xl">
                Elige tu especialidad y demuestra que eres el mejor. Puedes inscribirte en múltiples disciplinas si los horarios lo permiten.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DISCIPLINES.map((game) => (
              <HudCard key={game.id} className="group hover:-translate-y-2 transition-transform duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-hud-bg border border-hud-border group-hover:border-hud-accent/50 transition-colors">
                    <Gamepad2 size={24} style={{ color: GAME_COLORS[game.id] }} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-hud-text-secondary bg-hud-surface px-2 py-1">
                    {game.mode}
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-hud-text mb-2">{game.name}</h3>
                
                <div className="mt-6 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-hud-accent">
                    <DollarSign size={16} />
                    <span className="font-bold">2.00 USD</span>
                  </div>
                  <Link to="/register" className="text-hud-text-secondary hover:text-hud-text font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                    Inscribirse <ChevronRight size={14} />
                  </Link>
                </div>
              </HudCard>
            ))}
          </div>

          {/* Quick Registration CTA */}
          <div className="mt-16 text-center">
            <HudCard className="inline-block relative overflow-hidden">
              {/* Animated line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hud-accent to-transparent animate-pulse" />
              
              <h3 className="text-2xl font-black mb-2">¿Listo para competir?</h3>
              <p className="text-hud-text-secondary mb-6 max-w-md mx-auto">
                Asegura tu lugar en el torneo. Los cupos son limitados y se asignan por orden de registro y pago validado.
              </p>
              {user ? (
                <Link to={isAdmin ? "/admin" : "/dashboard"}>
                  <DiagonalButton>Ir al Panel</DiagonalButton>
                </Link>
              ) : (
                <Link to="/register">
                  <DiagonalButton>Registrarse</DiagonalButton>
                </Link>
              )}
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
          <div className="grid grid-cols-1 max-w-2xl mx-auto gap-8">
            {SCHEDULE.map((block, idx) => (
              <HudCard key={idx} clip="diagonal" className="relative flex flex-col h-full">
                {/* Location header */}
                <div className="mb-4 pb-4 border-b border-hud-border">
                  <h3 className="text-lg font-black uppercase tracking-wider text-hud-text mb-2 text-center">
                    {block.day}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-hud-text-secondary">
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

          {user ? (
            <Link to={isAdmin ? "/admin" : "/dashboard"}>
              <DiagonalButton className="text-lg px-12 py-5 inline-flex items-center gap-3">
                Ir al Panel
                <ChevronRight size={20} />
              </DiagonalButton>
            </Link>
          ) : (
            <Link to="/register">
              <DiagonalButton className="text-lg px-12 py-5 inline-flex items-center gap-3">
                Inscríbete Ahora
                <ChevronRight size={20} />
              </DiagonalButton>
            </Link>
          )}

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
