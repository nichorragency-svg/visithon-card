import React from 'react';

/**
 * Dark glass-friendly base — static (no animated mesh) so the screen stays visually stable.
 */
export default function GlassShell({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#030712] text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(79,70,229,0.08),transparent_55%),radial-gradient(ellipse_70%_45%_at_100%_50%,rgba(14,165,233,0.05),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(168,85,247,0.06),transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col">{children}</div>
    </div>
  );
}
