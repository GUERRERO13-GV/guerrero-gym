import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_BRAND_NAME } from '@shared/lib/brand';

interface BrandState {
  /** Nombre de marca de la sesión actual (`aitana-gym`) o el de por defecto. */
  name: string;
  setName: (name: string) => void;
}

/**
 * Persistido para que el título de la pestaña, los compartidos y el primer
 * pintado sigan el nombre del usuario incluso sin red. Fuera de React (p. ej.
 * `shareImage`) se lee con `useBrandStore.getState().name`.
 */
export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      name: DEFAULT_BRAND_NAME,
      setName: (name) => set({ name }),
    }),
    { name: 'gym-brand' },
  ),
);

/** Lectura puntual para código que no es un componente. */
export const getBrandName = (): string => useBrandStore.getState().name;
