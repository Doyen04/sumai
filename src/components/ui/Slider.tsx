import { cn } from '@/utils';

export interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    showValue?: boolean;
    disabled?: boolean;
    className?: string;
}

export function Slider({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = true,
    disabled = false,
    className,
}: SliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn('w-full', className)}>
            {(label || showValue) && (
                <div className="flex justify-between mb-2">
                    {label && (
                        <label className="text-sm font-medium text-foreground">
                            {label}
                        </label>
                    )}
                    {showValue && (
                        <span className="text-sm text-muted">{value}</span>
                    )}
                </div>
            )}
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    disabled={disabled}
                    className={cn(
                        'w-full h-2 appearance-none cursor-pointer',
                        'bg-surface rounded-full',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        '[&::-webkit-slider-thumb]:appearance-none',
                        '[&::-webkit-slider-thumb]:w-4',
                        '[&::-webkit-slider-thumb]:h-4',
                        '[&::-webkit-slider-thumb]:rounded-full',
                        '[&::-webkit-slider-thumb]:bg-accent',
                        '[&::-webkit-slider-thumb]:shadow-md',
                        '[&::-webkit-slider-thumb]:cursor-pointer',
                        '[&::-webkit-slider-thumb]:transition-transform',
                        '[&::-webkit-slider-thumb]:hover:scale-110',
                        '[&::-moz-range-thumb]:appearance-none',
                        '[&::-moz-range-thumb]:w-4',
                        '[&::-moz-range-thumb]:h-4',
                        '[&::-moz-range-thumb]:rounded-full',
                        '[&::-moz-range-thumb]:bg-accent',
                        '[&::-moz-range-thumb]:border-0',
                        '[&::-moz-range-thumb]:shadow-md',
                        '[&::-moz-range-thumb]:cursor-pointer'
                    )}
                    style={{
                        background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percentage}%, var(--color-surface) ${percentage}%, var(--color-surface) 100%)`,
                    }}
                />
            </div>
        </div>
    );
}
