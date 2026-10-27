import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button, Input, SectionHeader } from '@shared/components/ui';
import { fetchExercises } from '@shared/api/queries';
import { useAuthStore } from '@features/auth/stores/authStore';
import { useProfile } from '@features/auth/hooks/useProfile';
import {
  DAY_ORDER,
  useRoutineStore,
  type DayOfWeek,
  type Routine,
  type RoutineExercise,
} from '@features/routine/stores/routineStore';

const DAY_NAMES_ES: Record<DayOfWeek, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

/** Rutina propia vacía: siete días sin ejercicios, lista para rellenar. */
function emptyRoutine(name: string, description: string): Routine {
  const days = {} as Routine['days'];
  for (const d of DAY_ORDER) days[d] = { name: DAY_NAMES_ES[d], exercises: [] };
  return {
    id: `custom-${Date.now()}`,
    name,
    description,
    isCustom: true,
    createdAt: new Date().toISOString(),
    days,
  };
}

/**
 * Apartado «Mi rutina» de Ajustes.
 *
 * Cada persona pone aquí su propia rutina semanal (día a día, con sus
 * ejercicios, series y repeticiones) nada más registrarse, y luego la va
 * modificando cuando quiera. Escribe en el mismo `routineStore` que la
 * pantalla de Rutinas, así que lo que se guarda aquí es exactamente lo que
 * aparece al entrenar.
 */
export function MyRoutineSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { displayName } = useProfile();

  const routines = useRoutineStore((s) => s.routines);
  const activeRoutineId = useRoutineStore((s) => s.activeRoutineId);
  const addRoutine = useRoutineStore((s) => s.addRoutine);
  const updateRoutine = useRoutineStore((s) => s.updateRoutine);
  const setActiveRoutine = useRoutineStore((s) => s.setActiveRoutine);
  const cloneRoutine = useRoutineStore((s) => s.cloneRoutine);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() =>
    useRoutineStore.getState().getDayName(),
  );

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises', user?.id],
    queryFn: () => fetchExercises(user?.id),
    enabled: !!user?.id,
  });

  const active = routines.find((r) => r.id === activeRoutineId) ?? null;
  // Solo se edita aquí una rutina propia: las plantillas no se pueden guardar
  // en la nube tal cual, así que se copian antes (ver `copyTemplate`).
  const mine = active?.isCustom ? active : null;

  // Guardado en la nube al salir de un campo o al añadir/quitar: no en cada
  // pulsación, que lanzaría una escritura remota por letra.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persist = useCallback(() => {
    if (!user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const ok = await useRoutineStore.getState().saveToDb(user.id);
      if (!ok) toast.error(t('routine.save_failed'));
    }, 400);
  }, [user, t]);

  const createMine = () => {
    const owner = displayName || t('settings.my_routine_default_owner');
    const routine = emptyRoutine(
      t('settings.my_routine_default_name', { name: owner }),
      t('routine.custom_default_desc'),
    );
    addRoutine(routine);
    setActiveRoutine(routine.id);
    persist();
  };

  const copyTemplate = () => {
    if (!active) return;
    const newId = cloneRoutine(active.id, t('settings.my_routine_default_name', { name: displayName }));
    if (newId) {
      setActiveRoutine(newId);
      persist();
      toast.success(t('routine.cloned'));
    }
  };

  const setDayExercises = (day: DayOfWeek, next: RoutineExercise[]) => {
    if (!mine) return;
    updateRoutine(mine.id, {
      days: { ...mine.days, [day]: { ...mine.days[day], exercises: next } },
    });
  };

  const setDayName = (day: DayOfWeek, name: string) => {
    if (!mine) return;
    updateRoutine(mine.id, { days: { ...mine.days, [day]: { ...mine.days[day], name } } });
  };

  const patchExercise = (index: number, patch: Partial<RoutineExercise>) => {
    if (!mine) return;
    const list = mine.days[selectedDay].exercises.map((ex, i) =>
      i === index ? { ...ex, ...patch } : ex,
    );
    setDayExercises(selectedDay, list);
  };

  const addExercise = () => {
    if (!mine) return;
    setDayExercises(selectedDay, [
      ...mine.days[selectedDay].exercises,
      { name: '', sets: 3, reps: '10' },
    ]);
  };

  const removeExercise = (index: number) => {
    if (!mine) return;
    setDayExercises(
      selectedDay,
      mine.days[selectedDay].exercises.filter((_, i) => i !== index),
    );
    persist();
  };

  const day = mine?.days[selectedDay];

  return (
    <section>
      <SectionHeader title={t('settings.my_routine')} subtitle={t('settings.my_routine_desc')} />
      <div className="glass-2 rounded-card overflow-hidden p-4">
        {!mine && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-fg-muted">
              {active
                ? t('settings.my_routine_template_note', { name: active.name })
                : t('settings.my_routine_empty')}
            </p>
            <Button type="button" size="lg" onClick={createMine} className="w-full">
              {t('settings.my_routine_create')}
            </Button>
            {active && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={copyTemplate}
                className="w-full"
              >
                {t('settings.my_routine_copy')}
              </Button>
            )}
          </div>
        )}

        {mine && day && (
          <div className="flex flex-col gap-4">
            <div className="text-xs text-fg-subtle">{mine.name}</div>

            {/* Selector de día: un punto marca los días que ya tienen ejercicios. */}
            <div role="tablist" aria-label={t('settings.my_routine')} className="flex gap-1.5">
              {DAY_ORDER.map((d) => {
                const isSelected = d === selectedDay;
                const hasWork = mine.days[d].exercises.length > 0;
                return (
                  <button
                    key={d}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedDay(d)}
                    className={`label-caps relative min-h-11 flex-1 rounded-pill px-1 text-center transition-colors ${
                      isSelected ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-fg-muted'
                    }`}
                  >
                    {t(`routine.days.${d}`).slice(0, 3)}
                    {hasWork && (
                      <span
                        aria-hidden="true"
                        className={`absolute right-1.5 top-1.5 size-1.5 rounded-full ${
                          isSelected ? 'bg-accent-fg' : 'bg-accent'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <Input
              type="text"
              value={day.name}
              onChange={(e) => setDayName(selectedDay, e.target.value)}
              onBlur={persist}
              placeholder={t('settings.my_routine_day_name')}
              aria-label={t('settings.my_routine_day_name')}
            />

            {day.exercises.length === 0 && (
              <p className="text-sm text-fg-subtle">{t('settings.my_routine_rest_day')}</p>
            )}

            <datalist id="my-routine-exercises">
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.name} />
              ))}
            </datalist>

            <ul className="flex flex-col gap-3">
              {day.exercises.map((ex, i) => (
                <li
                  // La posición es la identidad: el plan no tiene ids de ejercicio.
                  key={i}
                  className="flex flex-col gap-2 rounded-card bg-surface-2 p-3"
                >
                  <Input
                    type="text"
                    list="my-routine-exercises"
                    value={ex.name}
                    onChange={(e) => patchExercise(i, { name: e.target.value })}
                    onBlur={persist}
                    placeholder={t('settings.my_routine_exercise')}
                    aria-label={t('settings.my_routine_exercise')}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={20}
                      value={ex.sets ?? ''}
                      onChange={(e) =>
                        patchExercise(i, {
                          sets: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                      onBlur={persist}
                      placeholder={t('settings.my_routine_sets')}
                      aria-label={t('settings.my_routine_sets')}
                    />
                    <span className="text-fg-subtle" aria-hidden="true">
                      ×
                    </span>
                    <Input
                      type="text"
                      value={ex.reps ?? ''}
                      onChange={(e) => patchExercise(i, { reps: e.target.value })}
                      onBlur={persist}
                      placeholder={t('settings.my_routine_reps')}
                      aria-label={t('settings.my_routine_reps')}
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(i)}
                      aria-label={t('settings.my_routine_remove')}
                      className="flex size-11 flex-shrink-0 items-center justify-center rounded-full text-error active:bg-hover"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <Button type="button" variant="secondary" onClick={addExercise} className="w-full">
              {t('settings.my_routine_add_exercise')}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/routines')}
              className="min-h-11 text-sm text-accent underline underline-offset-2"
            >
              {t('settings.my_routine_full_editor')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
