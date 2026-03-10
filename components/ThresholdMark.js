export default function ThresholdMark({ color = "currentColor", size = 28 }) {
  const w = size * 1.55
  return (
    <svg width={w} height={size} viewBox="0 0 124 80" fill="none">
      <path
        d="M0,0 L124,0 L124,80 L92,80 L92,52 L32,52 L32,80 L0,80 Z"
        fill={color}
      />
    </svg>
  )
}
