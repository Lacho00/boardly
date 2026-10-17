import type { Severity } from '@/lib/severity'
import { sparkPoints } from '@/lib/spark'
import { severityClass } from './SeverityTag'

const W = 100
const H = 30

export default function Sparkline({
  values,
  severity,
  zeroBased,
}: {
  values: number[]
  severity: Severity
  zeroBased?: boolean
}) {
  const points = sparkPoints(values, { width: W, height: H - 6, zeroBased })
  const shifted = points
    ? points
        .split(' ')
        .map((p) => {
          const [x, y] = p.split(',').map(Number)
          return `${x},${Math.round((y + 3) * 100) / 100}`
        })
        .join(' ')
    : ''
  const c = severityClass[severity]
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className="block h-9 w-full"
    >
      {shifted && (
        <>
          {zeroBased && (
            <polygon points={`0,${H} ${shifted} ${W},${H}`} className={`${c.fill} stroke-none`} opacity={0.12} />
          )}
          <polyline
            points={shifted}
            fill="none"
            strokeWidth={1.6}
            vectorEffect="non-scaling-stroke"
            className={c.stroke}
          />
        </>
      )}
    </svg>
  )
}
