import { describe, expect, it } from 'vitest';
import { brandFromUsername, DEFAULT_BRAND_NAME, slugifyBrand, splitBrand } from '../brand';

describe('brand', () => {
  it('genera <usuario>-gym en minúsculas', () => {
    expect(brandFromUsername('Aitana')).toBe('aitana-gym');
    expect(brandFromUsername('pepa')).toBe('pepa-gym');
    expect(brandFromUsername('ElBarra')).toBe('elbarra-gym');
  });

  it('quita espacios, tildes y símbolos', () => {
    expect(slugifyBrand('El Barra')).toBe('elbarra');
    expect(slugifyBrand('José_Mª!')).toBe('josem');
  });

  it('sin nombre válido vuelve a la marca por defecto', () => {
    expect(brandFromUsername('')).toBe(DEFAULT_BRAND_NAME);
    expect(brandFromUsername(null)).toBe(DEFAULT_BRAND_NAME);
    expect(brandFromUsername('###')).toBe(DEFAULT_BRAND_NAME);
  });

  it('recorta nombres larguísimos', () => {
    expect(slugifyBrand('a'.repeat(60)).length).toBeLessThanOrEqual(18);
  });

  it('parte la marca en prefijo y sufijo para el acento', () => {
    expect(splitBrand('aitana-gym')).toEqual(['aitana', '-gym']);
    expect(splitBrand('GUERRERO-GYM')).toEqual(['GUERRERO', '-GYM']);
    expect(splitBrand('sinsufijo')).toEqual(['sinsufijo', '']);
  });
});
