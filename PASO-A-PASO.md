# GUERRERO-GYM — Paso a paso

Hazlo en este orden. Cada bloque dice qué pulsar y qué copiar.
Lo que está marcado con 🔴 es imprescindible; lo demás es opcional.

---

## 0. Qué necesitas instalar (una vez)

- **Node.js 22** → https://nodejs.org (el proyecto usa la versión de `.nvmrc`)
- **Git** → https://git-scm.com
- **GitHub CLI** → https://cli.github.com (para subir el repo con un solo comando)
- Cuentas gratuitas en: **GitHub**, **Supabase**, **Vercel** y **Google Cloud**.

Descomprime `guerrero-gym.zip`, abre una terminal dentro de la carpeta `gymlog-main` y ejecuta:

```bash
npm install
```

---

## 1. 🔴 Base de datos y usuarios (Supabase)

1. Entra en https://supabase.com → **New project**. Ponle nombre (`guerrero-gym`), una contraseña de base de datos (guárdala) y la región **West EU**.
2. Cuando termine de crearse, ve a **Project Settings → API** y copia:
   - **Project URL** → es `VITE_SUPABASE_URL`
   - **anon public key** → es `VITE_SUPABASE_KEY`
3. En la terminal, dentro de la carpeta del proyecto:
   ```bash
   cp .env.example .env
   ```
   Abre `.env` y pega esos dos valores. **No subas nunca `.env` a GitHub** (ya está ignorado).
4. Crea las tablas. En la terminal:
   ```bash
   npx supabase init        # si pregunta por VS Code/IntelliJ, responde N
   npx supabase login       # se abre el navegador, acepta
   npx supabase link --project-ref TU_REF
   npx supabase db push
   ```
   `TU_REF` son las letras de tu URL: en `https://abcdefgh.supabase.co`, es `abcdefgh`.
   Te pedirá la contraseña de base de datos del paso 1.
5. Desplegar la función de borrar cuenta (la app la usa en Ajustes):
   ```bash
   npx supabase functions deploy delete-account
   ```

Probar en local: `npm run dev` y abre http://localhost:5173

> Aviso: las migraciones las escribió el autor original para su proyecto y yo no he podido
> ejecutarlas contra una base de datos vacía. Si `db push` da algún error, mándamelo tal cual y lo arreglamos.

---

## 2. 🔴 Entrar con Google

Es el botón «Entrar con Google» de la pantalla de login. Ya está en el código; falta darlo de alta en Google y en Supabase.

**A) Google Cloud**

1. https://console.cloud.google.com → crea un proyecto nuevo (`guerrero-gym`).
2. Menú **APIs y servicios → Pantalla de consentimiento de OAuth** → tipo **Externo** → nombre de la app `GUERRERO-GYM`, tu email de soporte y el de contacto → guardar.
   En **Público**, pulsa **Publicar app** para que pueda entrar cualquiera y no solo tú.
3. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo de aplicación: **Aplicación web**
   - **URI de redireccionamiento autorizados** → añade exactamente:
     `https://TU_REF.supabase.co/auth/v1/callback`
   - Crear. Copia el **ID de cliente** y el **Secreto de cliente**.

**B) Supabase**

1. **Authentication → Sign In / Providers → Google** → actívalo y pega el ID y el Secreto → Guardar.
2. **Authentication → URL Configuration**:
   - **Site URL**: la URL de tu app desplegada (paso 3). Mientras tanto, `http://localhost:5173`.
   - **Redirect URLs** → añade las tres:
     - `http://localhost:5173/auth/callback`
     - `https://TU-APP.vercel.app/auth/callback` (la de tu despliegue)
     - `com.guerrerogym.app://auth/callback` (para la app de Android)

Con esto funciona en web y en Android. Quien entra con Google obtiene su nombre `usuario-gym` a partir de su email (la parte antes de la `@`).

---

## 3. 🔴 Subir a GitHub

```bash
gh auth login                                  # una vez: elige GitHub.com → HTTPS → navegador
./scripts/publish-github.sh guerrero-gym       # repo PRIVADO
# o público:  ./scripts/publish-github.sh guerrero-gym --public
```

Si prefieres hacerlo a mano: crea un repo vacío en github.com y ejecuta
`git remote add origin https://github.com/TU_USUARIO/guerrero-gym.git && git push -u origin main`.

---

## 4. 🔴 Ponerla en internet (Vercel)

1. https://vercel.com → **Add New → Project** → importa el repo `guerrero-gym`.
2. En **Environment Variables** añade:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_KEY` = tu anon key
   - `VITE_WEB_ORIGIN` = la URL que te dé Vercel (p. ej. `https://guerrero-gym.vercel.app`; si aún no la sabes, despliega, cópiala y añádela después)
3. **Deploy**.
4. Vuelve al paso 2B y pon esa URL en *Site URL* y en *Redirect URLs*.

Cada `git push` a `main` redespliega solo.

---

## 5. 🔴 Datos legales (te toca a ti)

Las páginas `public/privacy-policy.html` y `public/terms.html` tenían los datos del autor original. Las he dejado con marcadores:

- `[TU NOMBRE COMPLETO]`
- `TU-EMAIL@EJEMPLO.COM`

Búscalos y sustitúyelos por los tuyos (Ctrl+Mayús+F en VS Code). Son los datos del responsable del tratamiento de los usuarios; no puedo ponerlos yo por ti.

---

## 6. Android (opcional)

```bash
npm run build:android      # compila la web y la copia al proyecto Android
npm run open:android       # abre Android Studio; ahí: Build → Build APK(s)
```

- Identificador de la app: `com.guerrerogym.app` (ya cambiado en todo el proyecto).
- El APK de prueba (debug) se instala como `com.guerrerogym.app.fitbody`; el de publicación necesita tu propia firma (keystore).
  Cómo crearla y firmarla está en `ios-custom/SIGNING.md` (iOS) y en `android/app/build.gradle` (Android lee `keystore.properties`).
- Para que se vea el botón «Descargar APK» en la web, sube tu APK a algún sitio y pon su enlace en `VITE_APK_URL`.
- iOS: ver `IOS_MANUAL.md` y `MAC_SETUP.md` (necesitas un Mac).

## 7. Cosas opcionales que NO funcionan hasta que las configures tú

| Función | Qué hace falta |
| --- | --- |
| Notificaciones push | Un proyecto de Firebase tuyo (`google-services.json`) y la función `send-push` |
| Entrenador IA | La función `ai-coach`, tu propia clave de API y `AI_COACH_ALLOWED_ORIGINS` con tu URL |
| Errores en Sentry | `VITE_SENTRY_DSN` (y `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` para subir mapas) |

Sin nada de esto la app funciona igual; solo faltan esas extras.

---

## Cómo se comporta lo que pediste

- **Nombre**: al registrarte con el usuario `aitana`, la app se llama `aitana-gym` (cabecera, título, compartidos). Sin sesión: `GUERRERO-GYM`.
- **Color**: Ajustes → Preferencias → *Color de acento*.
- **Rutina**: Ajustes → *Mi rutina*.
