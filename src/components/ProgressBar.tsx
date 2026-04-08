'use client';

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
}

export default function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  const progress = steps.length > 1
    ? (currentStep / (steps.length - 1)) * 100
    : currentStep > 0
      ? 100
      : 0;

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 opacity-50 blur-sm transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${
              i <= currentStep ? 'text-violet-300' : 'text-gray-600'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                i < currentStep
                  ? 'bg-violet-500 text-white'
                  : i === currentStep
                    ? 'bg-violet-500/30 text-violet-300 ring-2 ring-violet-400/50 animate-pulse'
                    : 'bg-white/10 text-gray-600'
              }`}
            >
              {i < currentStep ? '\u2713' : i + 1}
            </div>
            <span className="hidden sm:inline">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
