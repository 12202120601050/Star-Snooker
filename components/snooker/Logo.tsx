// Star Snooker Academy mark — crisp inline vector (gold cue cradling a red
// 15-ball rack), so it renders everywhere with no external file dependency.
// To use the exact photographic logo instead, save it as public/images/logo.png
// and swap this for a next/image (see git history).

const ROWS: number[][] = [
  [110],
  [96, 124],
  [82, 110, 138],
  [68, 96, 124, 152],
  [54, 82, 110, 138, 166],
]
const ROW_Y = [40, 64, 88, 112, 136]

export function Logo({ size = 120, className, glow = false }: { size?: number; className?: string; glow?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Star Snooker Academy"
      className={className}
      style={glow ? { filter: 'drop-shadow(0 0 22px rgba(242,176,30,0.5)) drop-shadow(0 0 38px rgba(224,31,38,0.4))' } : undefined}
    >
      <defs>
        <linearGradient id="cue-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe07a" />
          <stop offset="0.45" stopColor="#f2b01e" />
          <stop offset="0.75" stopColor="#ffd75e" />
          <stop offset="1" stopColor="#b9810f" />
        </linearGradient>
        <radialGradient id="ball-red" cx="0.36" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#ff6062" />
          <stop offset="0.5" stopColor="#e01f26" />
          <stop offset="1" stopColor="#8e0c12" />
        </radialGradient>
      </defs>

      {/* Gold cue swoosh cradling the rack */}
      <path d="M58 50 C34 88 34 137 70 160 C114 187 172 168 190 132" stroke="url(#cue-gold)" strokeWidth="15" strokeLinecap="round" />

      {/* Red balls + glossy highlight on each */}
      {ROWS.map((row, r) =>
        row.map((cx, i) => {
          const cy = ROW_Y[r]
          return (
            <g key={`${r}-${i}`}>
              <circle cx={cx} cy={cy} r="13" fill="url(#ball-red)" />
              <ellipse cx={cx - 4} cy={cy - 4.5} rx="4" ry="2.6" fill="#ffffff" opacity="0.55" />
            </g>
          )
        }),
      )}
    </svg>
  )
}
