# GUERRERO-GYM

Diario de entrenamiento (fuerza + cardio, estadísticas, rutinas, offline-first) para web/PWA y Android/iOS.

- **El nombre es personal**: al registrarte con el usuario `aitana` la app pasa a llamarse **aitana-gym**; con `pepa`, **pepa-gym**; con `elbarra`, **elbarra-gym**. Sin sesión se ve **GUERRERO-GYM**.
- **Color a elegir**: Ajustes → Preferencias → *Color de acento* (24 colores, con variante clara y oscura).
- **Mi rutina**: Ajustes → *Mi rutina*. Cada persona pone su rutina semanal (día, ejercicios, series y reps) y la modifica cuando quiera.

> **Empieza por [`PASO-A-PASO.md`](PASO-A-PASO.md)**: Supabase, entrar con Google, GitHub, Vercel y Android.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # rellena VITE_SUPABASE_URL y VITE_SUPABASE_KEY
npm run dev
```

### Base de datos (Supabase)

1. Crea un proyecto en <https://supabase.com>.
2. Aplica las migraciones de `supabase/migrations/` (con la CLI: `supabase link` y `supabase db push`).
3. Authentication → URL Configuration: añade tu URL de despliegue y `/auth/callback`.
4. (Opcional) Authentication → Providers → Google, para "Entrar con Google".

### Scripts útiles

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Tests (Vitest) |
| `npm run type-check` | Comprobación de tipos |

## Origen y licencia

Basada en [GymLog](https://github.com/Haplee/gymlog) de Fran Vidal Mateo (Haplee), bajo licencia MIT (ver `LICENSE`, que conserva el aviso de copyright original).
El README original está en `docs/README-gymlog-original.md`.
