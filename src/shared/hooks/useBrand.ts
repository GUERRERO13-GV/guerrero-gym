import { useEffect } from 'react';
import { useAuthStore } from '@features/auth/stores/authStore';
import { useProfile } from '@features/auth/hooks/useProfile';
import { brandFromUsername, DEFAULT_BRAND_NAME, splitBrand } from '@shared/lib/brand';
import { useBrandStore } from '@shared/stores/brandStore';

/**
 * Nombre de marca visible. Lee del store persistido, así que es inmediato y
 * funciona offline; `useBrandSync` es quien lo mantiene al día.
 */
export function useBrand() {
  const name = useBrandStore((s) => s.name);
  const [prefix, suffix] = splitBrand(name);
  return { name, prefix, suffix };
}

/**
 * Deriva la marca del usuario con sesión y la guarda. Prioridad: `username`
 * del registro (metadatos de auth, disponible al instante) → `username` del
 * perfil (cubre el alta con Google) → prefijo del email. Sin sesión, marca por
 * defecto. Se monta una sola vez, en la raíz de la app.
 */
export function useBrandSync() {
  const user = useAuthStore((s) => s.user);
  const { username: profileUsername, emailName } = useProfile();
  const setName = useBrandStore((s) => s.setName);

  const metaUsername =
    typeof user?.user_metadata?.username === 'string' ? user.user_metadata.username : '';

  useEffect(() => {
    if (!user) {
      setName(DEFAULT_BRAND_NAME);
      return;
    }
    setName(brandFromUsername(metaUsername || profileUsername || emailName));
  }, [user, metaUsername, profileUsername, emailName, setName]);

  const name = useBrandStore((s) => s.name);
  useEffect(() => {
    document.title = name;
  }, [name]);
}
