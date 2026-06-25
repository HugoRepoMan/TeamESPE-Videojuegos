import PageShell from '../components/ui/PageShell';
import BracketView from '../features/tournament/BracketView';

export default function BracketsPage() {
  return (
    <PageShell title="Llaves del Torneo" showBack>
      <BracketView />
    </PageShell>
  );
}
