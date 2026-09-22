import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <p className="text-5xl font-black">404</p>
      <p className="text-sm text-slate-500 mt-2">Cette page n’existe pas.</p>
      <Link href="/dashboard" className="mt-6 bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
