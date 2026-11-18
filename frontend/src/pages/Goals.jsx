import { useCallback, useEffect, useState } from 'react';
import { PiggyBank, Plus } from 'lucide-react';
import api, { getErrorMessage } from '../services/api.js';
import Modal from '../components/Modal.jsx';
import GoalCard from '../components/GoalCard.jsx';
import GoalForm from '../components/GoalForm.jsx';
import ContributeForm from '../components/ContributeForm.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // { type: 'form' | 'contribute', goal }

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveGoal = async (payload) => {
    if (modal.goal) await api.put(`/goals/${modal.goal.id}`, payload);
    else await api.post('/goals', payload);
    setModal(null);
    await load();
  };

  const contribute = async (payload) => {
    await api.post(`/goals/${modal.goal.id}/contribute`, payload);
    setModal(null);
    await load();
  };

  const remove = async (goal) => {
    if (!window.confirm(`¿Eliminar la meta "${goal.titulo}"? Los movimientos ya registrados se conservan.`)) return;
    try {
      await api.delete(`/goals/${goal.id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const active = goals.filter((g) => g.estado !== 'Completada');
  const done = goals.filter((g) => g.estado === 'Completada');

  const renderGrid = (list) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {list.map((g) => (
        <GoalCard
          key={g.id}
          goal={g}
          onContribute={(goal) => setModal({ type: 'contribute', goal })}
          onEdit={(goal) => setModal({ type: 'form', goal })}
          onDelete={remove}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Metas de ahorro</h1>
          <p className="text-sm text-slate-500">Define cuánto quieres ahorrar, para cuándo, y abona a medida que avanzas.</p>
        </div>
        <button onClick={() => setModal({ type: 'form', goal: null })} className="btn-success">
          <Plus className="h-4 w-4" aria-hidden="true" /> Nueva meta
        </button>
      </div>

      <ErrorAlert message={error} onRetry={load} />

      {loading ? (
        <Spinner label="Cargando metas…" />
      ) : goals.length === 0 ? (
        <div className="card">
          <EmptyState icon={PiggyBank} title="Aún no tienes metas" text="Crea tu primera meta de ahorro: un viaje, un fondo de emergencia, un equipo nuevo."
            action={<button onClick={() => setModal({ type: 'form', goal: null })} className="btn-success">Crear meta</button>} />
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-extrabold text-slate-900">En progreso ({active.length})</h2>
              {renderGrid(active)}
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-extrabold text-slate-900">Completadas ({done.length})</h2>
              {renderGrid(done)}
            </section>
          )}
        </>
      )}

      {modal?.type === 'form' && (
        <Modal title={modal.goal ? 'Editar meta' : 'Nueva meta'} onClose={() => setModal(null)}>
          <GoalForm initial={modal.goal} onSubmit={saveGoal} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'contribute' && (
        <Modal title="Abonar a la meta" onClose={() => setModal(null)}>
          <ContributeForm goal={modal.goal} onSubmit={contribute} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
