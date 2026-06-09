"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode, RefObject } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { diffLines } from "diff";

// ---- Ejemplo precargado: que el diff se vea al abrir -------------------------
const EJEMPLO_ORIGINAL = `SELECT id, nombre, email
FROM usuarios
WHERE activo = 1
ORDER BY nombre;`;

const EJEMPLO_MODIFICADO = `SELECT id, nombre, email, telefono
FROM usuarios
WHERE activo = 1 AND verificado = 1
ORDER BY creado_en DESC;`;

// ---- Resumen +/- al estilo diffstat de git ----------------------------------
type Resumen = { agregadas: number; eliminadas: number };

function calcularResumen(original: string, modificado: string): Resumen {
  const partes = diffLines(original, modificado);
  let agregadas = 0;
  let eliminadas = 0;
  for (const parte of partes) {
    if (!parte.count) continue;
    if (parte.added) agregadas += parte.count;
    else if (parte.removed) eliminadas += parte.count;
  }
  return { agregadas, eliminadas };
}

// ---- Iconos: un solo set stroke-based (16px), sin emojis --------------------
type IconProps = { className?: string };

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const IconSun = (p: IconProps) => (
  <Icon className={p.className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </Icon>
);
const IconMoon = (p: IconProps) => (
  <Icon className={p.className}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
);
const IconSwap = (p: IconProps) => (
  <Icon className={p.className}>
    <path d="M7 4 4 7l3 3M4 7h13M17 20l3-3-3-3M20 17H7" />
  </Icon>
);
const IconTrash = (p: IconProps) => (
  <Icon className={p.className}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" />
  </Icon>
);
const IconUpload = (p: IconProps) => (
  <Icon className={p.className}>
    <path d="M12 15V4M8 8l4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
  </Icon>
);

// Marca: tile slate con divisor (split view) + minus rose / plus emerald.
function LogoMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      role="img"
      aria-label="Visor de Diferencias"
      className="shrink-0"
    >
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="7"
        className="fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
        strokeWidth="1.5"
      />
      <rect x="7" y="8.5" width="15" height="3" rx="1.5" className="fill-slate-400 dark:fill-slate-500" />
      <rect x="7" y="14.5" width="19" height="3" rx="1.5" className="fill-emerald-500" />
      <rect x="7" y="20.5" width="12" height="3" rx="1.5" className="fill-rose-500" />
    </svg>
  );
}

// ---- Tokens de chrome: borders-only, hue slate, sin glass -------------------
const btnBase =
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium " +
  "transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-emerald-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950 " +
  "disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px";

const btnQuiet =
  btnBase +
  " border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 " +
  "dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/60 dark:hover:text-white";

export default function DiffViewer() {
  const [textoOriginal, setTextoOriginal] = useState<string>(EJEMPLO_ORIGINAL);
  const [textoModificado, setTextoModificado] =
    useState<string>(EJEMPLO_MODIFICADO);
  const [splitView, setSplitView] = useState<boolean>(true);
  const [darkTheme, setDarkTheme] = useState<boolean>(true); // oscuro por defecto
  const [showDiffOnly, setShowDiffOnly] = useState<boolean>(false);

  const fileOriginalRef = useRef<HTMLInputElement>(null);
  const fileModificadoRef = useRef<HTMLInputElement>(null);

  // El toggle de tema pinta toda la página (no solo el visor de diff).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkTheme);
  }, [darkTheme]);

  const resumen = useMemo<Resumen>(
    () => calcularResumen(textoOriginal, textoModificado),
    [textoOriginal, textoModificado],
  );

  const ambosVacios = !textoOriginal && !textoModificado;
  const totalCambios = resumen.agregadas + resumen.eliminadas;
  const propAgregadas = totalCambios ? resumen.agregadas / totalCambios : 0;

  // ---- Handlers -------------------------------------------------------------
  const leerArchivo = (
    e: ChangeEvent<HTMLInputElement>,
    set: (valor: string) => void,
  ): void => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = () => set(String(reader.result ?? ""));
    reader.readAsText(archivo);
    e.target.value = ""; // permite recargar el mismo archivo
  };

  const intercambiar = (): void => {
    setTextoOriginal(textoModificado);
    setTextoModificado(textoOriginal);
  };

  const limpiar = (): void => {
    setTextoOriginal("");
    setTextoModificado("");
  };

  // ---- Render ---------------------------------------------------------------
  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar tipo editor: misma hue que el canvas, separada por borde */}
      <header className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Visor de Diferencias
          </h1>
          <Diffstat
            agregadas={resumen.agregadas}
            eliminadas={resumen.eliminadas}
            propAgregadas={propAgregadas}
            sinCambios={!ambosVacios && totalCambios === 0}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Toggle
            label="Lado a lado"
            altLabel="En línea"
            activo={splitView}
            onChange={() => setSplitView((v) => !v)}
          />
          <Toggle
            label="Solo cambios"
            altLabel="Todo"
            activo={showDiffOnly}
            onChange={() => setShowDiffOnly((v) => !v)}
          />
          <button
            type="button"
            className={btnQuiet}
            onClick={() => setDarkTheme((v) => !v)}
            aria-pressed={darkTheme}
            title={darkTheme ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          >
            {darkTheme ? <IconSun /> : <IconMoon />}
            {darkTheme ? "Claro" : "Oscuro"}
          </button>
          <button
            type="button"
            className={btnQuiet}
            onClick={intercambiar}
            disabled={ambosVacios}
            title="Intercambiar original y modificado"
          >
            <IconSwap />
            Intercambiar
          </button>
          <button
            type="button"
            className={btnQuiet}
            onClick={limpiar}
            disabled={ambosVacios}
            title="Vaciar ambos paneles"
          >
            <IconTrash />
            Limpiar
          </button>
        </div>
      </header>

      {/* Entradas: columnas en desktop, apiladas en mobile */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PanelEntrada
          titulo="Original"
          acento="rose"
          valor={textoOriginal}
          onChange={setTextoOriginal}
          onCargarArchivo={() => fileOriginalRef.current?.click()}
          fileRef={fileOriginalRef}
          onFile={(e) => leerArchivo(e, setTextoOriginal)}
        />
        <PanelEntrada
          titulo="Modificado"
          acento="emerald"
          valor={textoModificado}
          onChange={setTextoModificado}
          onCargarArchivo={() => fileModificadoRef.current?.click()}
          fileRef={fileModificadoRef}
          onFile={(e) => leerArchivo(e, setTextoModificado)}
        />
      </div>

      {/* Diff a todo el ancho */}
      <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Diferencias
          </span>
          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
            {splitView ? "lado a lado" : "en línea"}
            {showDiffOnly ? " · solo cambios" : ""}
          </span>
        </div>

        {ambosVacios ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto bg-white font-mono text-[13px] leading-relaxed dark:bg-slate-950">
            <ReactDiffViewer
              oldValue={textoOriginal}
              newValue={textoModificado}
              splitView={splitView}
              useDarkTheme={darkTheme}
              showDiffOnly={showDiffOnly}
              compareMethod={DiffMethod.WORDS}
              leftTitle="Original"
              rightTitle="Modificado"
            />
          </div>
        )}
      </section>
    </div>
  );
}

// ---- Subcomponentes ---------------------------------------------------------

function Diffstat({
  agregadas,
  eliminadas,
  propAgregadas,
  sinCambios,
}: {
  agregadas: number;
  eliminadas: number;
  propAgregadas: number;
  sinCambios: boolean;
}) {
  if (sinCambios) {
    return (
      <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
        sin cambios
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
        +{agregadas}
      </span>
      <span className="tabular-nums text-rose-600 dark:text-rose-400">
        −{eliminadas}
      </span>
      <span
        className="flex h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        aria-hidden
      >
        <span
          className="h-full bg-emerald-500 transition-[width] duration-200 ease-out"
          style={{ width: `${propAgregadas * 100}%` }}
        />
        <span
          className="h-full bg-rose-500 transition-[width] duration-200 ease-out"
          style={{ width: `${(1 - propAgregadas) * 100}%` }}
        />
      </span>
    </div>
  );
}

function Toggle({
  label,
  altLabel,
  activo,
  onChange,
}: {
  label: string;
  altLabel: string;
  activo: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={activo}
      className={btnQuiet}
    >
      <span
        className={
          "h-1.5 w-1.5 rounded-full transition-colors duration-150 " +
          (activo ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-600")
        }
        aria-hidden
      />
      {activo ? label : altLabel}
    </button>
  );
}

function PanelEntrada({
  titulo,
  acento,
  valor,
  onChange,
  onCargarArchivo,
  fileRef,
  onFile,
}: {
  titulo: string;
  acento: "rose" | "emerald";
  valor: string;
  onChange: (valor: string) => void;
  onCargarArchivo: () => void;
  fileRef: RefObject<HTMLInputElement>;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const punto = acento === "rose" ? "bg-rose-500" : "bg-emerald-500";
  const lineas = valor ? valor.split("\n").length : 0;
  const inputId = `panel-${acento}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-800">
        <label htmlFor={inputId} className="flex items-center gap-2">
          <span className={"h-2 w-2 rounded-full " + punto} aria-hidden />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {titulo}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
            {lineas} {lineas === 1 ? "línea" : "líneas"}
          </span>
        </label>
        <button
          type="button"
          onClick={onCargarArchivo}
          className={
            btnBase +
            " border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 " +
            "dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          }
        >
          <IconUpload />
          Cargar archivo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".sql,.txt,.js,.ts,.jsx,.tsx,.json,.css,.html,.md,.py,.java,.go,.rb,.php,.yml,.yaml,.xml,.csv"
          className="hidden"
          onChange={onFile}
        />
      </div>
      <textarea
        id={inputId}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder={`Pegá o escribí el contenido ${titulo}…`}
        className="h-56 w-full resize-y bg-slate-50 p-3 font-mono text-[13px] leading-relaxed text-slate-800 outline-none transition-colors duration-150 placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 bg-white px-6 py-16 text-center dark:bg-slate-950">
      <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
        +0 −0
      </span>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Escribí o cargá contenido en ambos paneles para ver las diferencias.
      </p>
    </div>
  );
}
