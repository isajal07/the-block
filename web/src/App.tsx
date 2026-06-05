import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-black text-white">
              B
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              The Block
            </span>
            <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 sm:inline">
              OPENLANE
            </span>
          </Link>
          <span className="text-sm text-slate-500">Buyer auction</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/70 py-6 text-center text-xs text-slate-400">
        Prototype · Vehicle data is synthetic · The Block
      </footer>
    </div>
  )
}
