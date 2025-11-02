"use client"

interface ConfidenceGaugeProps {
  score: number
}

export default function ConfidenceGauge({ score }: ConfidenceGaugeProps) {
  const getColor = (score: number) => {
    if (score >= 90) return "text-primary"
    if (score >= 75) return "text-primary/80"
    if (score >= 60) return "text-primary/60"
    return "text-primary/40"
  }

  const getBackgroundColor = (score: number) => {
    if (score >= 90) return "bg-primary"
    if (score >= 75) return "bg-primary/80"
    if (score >= 60) return "bg-primary/60"
    return "bg-primary/40"
  }

  const getLabel = (score: number) => {
    if (score >= 90) return "Very High Confidence"
    if (score >= 75) return "High Confidence"
    if (score >= 60) return "Moderate Confidence"
    return "Lower Confidence"
  }

  return (
    <div className="space-y-6">
      {/* Circular Gauge */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg className="transform -rotate-90" width="220" height="220">
            {/* Background circle */}
            <circle
              cx="110"
              cy="110"
              r="90"
              stroke="currentColor"
              strokeWidth="14"
              fill="none"
              className="text-border"
            />
            {/* Progress circle */}
            <circle
              cx="110"
              cy="110"
              r="90"
              stroke="currentColor"
              strokeWidth="14"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - score / 100)}`}
              className={getBackgroundColor(score).replace("bg-", "text-")}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${getColor(score)}`}>{score.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground mt-2">Confidence</span>
          </div>
        </div>
      </div>

      {/* Label and Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-foreground">{getLabel(score)}</span>
          <span className="text-sm text-muted-foreground">{score.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBackgroundColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Confidence Scale Reference */}
      <div className="grid grid-cols-4 gap-3 text-xs text-center mt-6">
        <div className="space-y-2">
          <div className="h-2 bg-primary/40 rounded" />
          <span className="text-muted-foreground">0-59%</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-primary/60 rounded" />
          <span className="text-muted-foreground">60-74%</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-primary/80 rounded" />
          <span className="text-muted-foreground">75-89%</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-primary rounded" />
          <span className="text-muted-foreground">90-100%</span>
        </div>
      </div>
    </div>
  )
}
