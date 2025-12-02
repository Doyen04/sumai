import { cn } from '@/utils';

interface ProgressBarProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export function ProgressBar({
    value,
    max = 100,
    size = 'md',
    showLabel = false,
    className,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-muted">Progress</span>
                    <span className="text-sm font-medium text-foreground">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div
                className={cn(
                    'w-full bg-surface rounded-full overflow-hidden',
                    sizes[size]
                )}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
            >
                <div
                    className="h-full bg-accent transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
