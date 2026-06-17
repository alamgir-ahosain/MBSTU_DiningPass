// export function WelcomeBanner({ firstName }: { firstName: string }) {
//   return (
//     <div className="rounded-2xl bg-gradient-to-br from-rose-900 via-purple-900 to-sky-700 text-white p-8 mb-8 shadow-academic">
//       <div className="text-sm opacity-90 uppercase tracking-widest">Welcome back</div>
//       <h1 className="font-display text-3xl md:text-4xl mt-1">{firstName}</h1>
//       <div className="mt-2 opacity-90 text-sm">System · Super Admin Dashboard</div>
//     </div>
//   );
// }


interface WelcomeBannerProps {
  fullName?: string | null;
  roleLabel: string;
  hallShortName?: string;
}

export function WelcomeBanner({
  fullName,
  roleLabel,
  hallShortName,
}: WelcomeBannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-900 via-purple-900 to-sky-700 text-white p-8 mb-8 shadow-academic">
      <div className="text-sm opacity-90 uppercase tracking-widest">
        Welcome back
      </div>

      <h1 className="font-display text-3xl md:text-4xl mt-1">
        {fullName ?? "User"}
      </h1>

      {hallShortName && (
        <div className="mt-2 opacity-90 text-sm">
          {hallShortName}
        </div>
      )}

      <div className="mt-1 opacity-90 text-sm">
        {roleLabel}
      </div>
    </div>
  );
}