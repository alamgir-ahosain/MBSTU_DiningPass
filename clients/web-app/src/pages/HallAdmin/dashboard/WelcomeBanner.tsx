export function WelcomeBanner({
  fullName,
  hallShortName,
  roleLabel,
}: {
  fullName: string;
  hallShortName: string;
  roleLabel: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-amber-700 text-white p-8 mb-8 shadow-academic">
      <div className="text-sm opacity-90 uppercase tracking-widest">Welcome back</div>
      <h1 className="font-display text-3xl md:text-4xl mt-1">{fullName}</h1>
      <div className="mt-2 opacity-90 text-sm">
        {hallShortName} · {roleLabel}
      </div>
    </div>
  );
}