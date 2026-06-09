# Visor de Diferencias

Herramienta de comparación de dos textos o fragmentos de código (diff viewer).

- **Register:** product (tool — el diseño sirve a la tarea, no es marketing).
- **Usuario:** developer / DBA comparando dos versiones de SQL o código, foco alto, quiere detectar cambios al instante.
- **Tarea principal:** pegar/cargar dos textos y ver líneas agregadas/eliminadas y diff a nivel de palabra.
- **Feel:** preciso, frío-técnico, tipo editor/terminal, calmo. Tema oscuro por defecto.

## Design

- **Estrategia de color:** Restrained. Neutral slate (hue única, shift de lightness), un acento emerald para acción/selección, rose/emerald semánticos para del/add.
- **Depth:** borders-only (low-opacity), sin sombras decorativas, sin glass.
- **Tipografía:** una sans para chrome (system stack) + mono tabular para textareas, diff y contadores.
- **Signature:** diffstat estilo git (`+N −M` con barra de proporción).
- **Iconos:** un solo set stroke-based inline (16px), sin emojis.
- **Motion:** 150ms, solo estado, respeta `prefers-reduced-motion`.
- **Surfaces:** canvas `slate-950` → panel `slate-900` → input `slate-950` (inset). Light theme = inverso.
