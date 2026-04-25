"use client";

// ─── Flower SVG ──────────────────────────────────────────────────────────────
function Flower({
  size,
  fill,
  rotate = 0,
  className,
}: {
  size: number;
  fill: string;
  rotate?: number;
  className?: string;
}) {
  // 4-petal flower built from overlapping ellipses
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
    >
      <g transform={`translate(50,50) rotate(${rotate})`}>
        {[0, 90, 180, 270].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-22"
            rx="21"
            ry="24"
            fill={fill}
            transform={`rotate(${deg})`}
          />
        ))}
        <circle cx="0" cy="0" r="14" fill="#f8f6f5" />
      </g>
    </svg>
  );
}

// ─── Google icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.09-6.09C34.46 3.1 29.48 1 24 1 14.82 1 6.96 6.48 3.28 14.34l7.1 5.52C12.17 13.67 17.62 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v8.98h12.43c-.54 2.9-2.18 5.35-4.64 7l7.1 5.52C43.18 37.14 46.1 31.27 46.1 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.38 28.14A14.5 14.5 0 0 1 9.5 24c0-1.43.2-2.82.56-4.14l-7.1-5.52A23.94 23.94 0 0 0 0 24c0 3.87.92 7.53 2.55 10.78l7.83-6.64z"
      />
      <path
        fill="#34A853"
        d="M24 47c5.48 0 10.08-1.82 13.44-4.94l-7.1-5.52C28.64 38.08 26.44 39 24 39c-6.38 0-11.83-4.17-13.62-9.86l-7.83 6.64C6.96 43.52 14.82 47 24 47z"
      />
    </svg>
  );
}

// ─── Login Page ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen w-full bg-[#f8f6f5] overflow-hidden flex items-center justify-center"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
    >
        {/* --- Decorative flowers --- */}

        {/* Top-right: large pink flower */}
        <div className="absolute -top-15 -right-15 pointer-events-none z-0">
            <Flower size={400} fill="#fce4e4" rotate={30} />
        </div>

        {/* Top-right: small blue flower */}
        <div className="absolute top-7.5 right-80 pointer-events-none z-10">
            <Flower size={100} fill="#d1ecf1" rotate={65} />
        </div>

        {/* Bottom-left: large pink flower */}
        <div className="absolute -bottom-15 -left-15 pointer-events-none z-0">
            <Flower size={400} fill="#fce4e4" rotate={30}  />
        </div>

        {/* Bottom-left: small blue flower */}
        <div className="absolute bottom-7.5 left-80 pointer-events-none z-10">
            <Flower size={100} fill="#d1ecf1" rotate={65} />
        </div>

        {/* ── Center card ── */}
        <div className="flex flex-col items-center gap-6 z-10">
            {/* Logo */}
            <div className="flex flex-col items-center gap-4">
                <h1 className="text-[40px] font-bold italic text-[#5d5d5a] leading-none">
                    planno
                </h1>
                <p className="text-base font-normal text-[#5d5d5a]">
                    Rencanakan harimu lebih cerdas.
                </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-[14px] shadow-[0px_4px_4px_0px_rgba(33,33,33,0.12)] w-100 px-7.5 py-6 flex flex-col items-center gap-4">
                {/* Google login button */}
                <button className="w-85 h-10.25 flex items-center justify-center gap-2.5 bg-white border border-[rgba(93,93,90,0.2)] rounded-[10.5px] text-sm font-semibold text-[#2d2d2d] hover:bg-[#f5f5f5] transition-colors cursor-pointer">
                    Masuk dengan Google
                    <GoogleIcon />
                </button>
            </div>
        </div>
    </div>
  );
}