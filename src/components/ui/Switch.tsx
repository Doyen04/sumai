import { cn } from '@/utils';

export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

export function Switch({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    size = 'md',
    className,
}: SwitchProps) {
    const sizes = {
        sm: {
            track: 'w-8 h-4',
            thumb: 'w-3 h-3',
            translate: 'translate-x-4',
        },
        md: {
            track: 'w-10 h-5',
            thumb: 'w-4 h-4',
            translate: 'translate-x-5',
        },
    };

    const currentSize = sizes[size];

    return (
        <label
            className={cn(
                'flex items-center gap-3 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    'relative inline-flex shrink-0 rounded-full',
                    'transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    checked ? 'bg-accent' : 'bg-border',
                    currentSize.track
                )}
            >
                <span
                    className={cn(
                        'inline-block rounded-full bg-white shadow-sm',
                        'transform transition-transform duration-200',
                        'mt-0.5 ml-0.5',
                        checked && currentSize.translate,
                        currentSize.thumb
                    )}
                />
            </button>
            {(label || description) && (
                <div className="flex-1">
                    {label && (
                        <span className="text-sm font-medium text-foreground">{label}</span>
                    )}
                    {description && (
                        <p className="text-sm text-muted mt-0.5">{description}</p>
                    )}
                </div>
            )}
        </label>
    );
}
