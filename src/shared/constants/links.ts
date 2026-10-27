/**
 * Enlaces externos.
 *
 * `VITE_APK_URL` apunta a donde publiques tu propio APK. Si no se define, los
 * botones «Descargar APK» no se muestran (el original apuntaba al servidor del
 * autor de GymLog y habría descargado otra app).
 */
export const APK_DOWNLOAD_URL: string = import.meta.env.VITE_APK_URL ?? '';
