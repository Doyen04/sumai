import { cn } from '@/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md';
}

export function Badge({
    className,
    variant = 'default',
    size = 'md',
    children,
    ...props
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center font-medium rounded-full';

    const variants = {
        default: 'bg-surface text-muted',
        success: 'bg-success-light text-success',
        warning: 'bg-warning-light text-warning',
        error: 'bg-error-light text-error',
        info: 'bg-accent-light text-accent',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
    };

    return (
        <span
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </span>
    );
}
