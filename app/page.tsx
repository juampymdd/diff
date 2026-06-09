import DiffViewer from "./components/DiffViewer";

// Server Component: solo arma el marco y delega la interactividad
// al componente cliente DiffViewer (que usa APIs del navegador).
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <DiffViewer />
    </main>
  );
}
