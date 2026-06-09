# diff

Visor de diferencias (diff viewer) entre dos textos o fragmentos de código.

Next.js 14 (App Router, TypeScript) + Tailwind CSS + `react-diff-viewer-continued`.

## Features

- Dos paneles editables (Original / Modificado) con carga de archivos vía `FileReader`.
- Diff en vivo: numeración de líneas, add (verde) / del (rojo), diff a nivel de palabra (`DiffMethod.WORDS`).
- Toggle lado a lado / en línea, claro / oscuro (oscuro por defecto), solo cambios.
- Intercambiar y limpiar paneles.
- Resumen diffstat estilo git (`+N −M`).

## Desarrollo

```bash
npm install
npm run dev   # http://localhost:3000
```

## Build

```bash
npm run build
npm start
```
