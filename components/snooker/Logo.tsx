import Image from 'next/image'

// Star Snooker Academy logo. Uses the real artwork at /public/images/logo.png.
// (Save the uploaded logo there — a transparent-background PNG looks best on
// the dark theme.) Same props as before, so every usage updates automatically.
export function Logo({ size = 120, className, glow = false }: { size?: number; className?: string; glow?: boolean }) {
  return (
    <Image
      src="/images/logo.png"
      alt="Star Snooker Academy"
      width={size}
      height={size}
      priority
      className={className}
      style={{
        width: size,
        height: 'auto',
        filter: glow ? 'drop-shadow(0 0 22px rgba(242,176,30,0.5)) drop-shadow(0 0 38px rgba(224,31,38,0.4))' : undefined,
      }}
    />
  )
}
