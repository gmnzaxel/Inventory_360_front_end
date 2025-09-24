# Inventory 360 Frontend

App React (Create React App) para Inventory 360.

## Configuración rápida

- Crear `.env` en esta carpeta con:

```
REACT_APP_API_BASE=http://localhost:8000
```

- Instalar y arrancar:

```
npm install
npm start
```

## Estructura

- `src/api/client.js`: cliente Axios con refresh automático de JWT.
- `src/config/api.js`: prefijos de API compartidos (`CONTROL_PREFIX`, `USER_PREFIX`).
- `src/context/`: contextos de Auth y Theme.
- `src/pages/` y `src/components/`: UI y flujos principales.

## Notas de ordenamiento

- Se removió el archivo no usado `main.jsx` (residuo de Vite). El entry real es `src/index.js`.
- Se centralizaron los prefijos de API en `src/config/api.js` y se actualizó el código para importarlos en vez de duplicar constantes.

## Backend esperado

- API base: `REACT_APP_API_BASE` (por defecto `http://localhost:8000`).
- Rutas: `'/api/control'` (inventario) y `'/user-control'` (usuarios/auth).
