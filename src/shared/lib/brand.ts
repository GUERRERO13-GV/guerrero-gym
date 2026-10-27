/**
 * Nombre de la app. Es dinámico: cada persona ve `<usuario>-gym`
 * (aitana-gym, pepa-gym, elbarra-gym…) a partir del nombre de usuario con el
 * que se registró. Sin sesión se muestra la marca por defecto.
 */
export const DEFAULT_BRAND_NAME = 'GUERRERO-GYM';

/** Sufijo común a todas las marcas personales. */
export const BRAND_SUFFIX = '-gym';

const MAX_SLUG_LENGTH = 18;

/**
 * Convierte un nombre de usuario en el prefijo de la marca: minúsculas, sin
 * tildes, sin espacios ni símbolos. «El Barra» → «elbarra», «Aitana_M» → «aitanam».
 * Devuelve '' si no queda nada aprovechable.
 */
export function slugifyBrand(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, MAX_SLUG_LENGTH);
}

/**
 * Nombre de marca para un usuario: `aitana-gym`. Si no hay nombre válido,
 * vuelve a la marca por defecto en vez de inventar «-gym» a secas.
 */
export function brandFromUsername(username: string | null | undefined): string {
  const slug = slugifyBrand(username);
  return slug ? `${slug}${BRAND_SUFFIX}` : DEFAULT_BRAND_NAME;
}

/**
 * Parte la marca en [prefijo, sufijo] para pintar el wordmark con el sufijo en
 * color de acento: «aitana-gym» → ['aitana', '-gym'].
 */
export function splitBrand(brand: string): [string, string] {
  const idx = brand.toLowerCase().lastIndexOf(BRAND_SUFFIX);
  if (idx <= 0) return [brand, ''];
  return [brand.slice(0, idx), brand.slice(idx)];
}
