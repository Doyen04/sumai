import { cn } from '@/utils';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}
        >
            {icon && (
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-surface mb-4 text-muted">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
            )}
            {action}
        </div>
    );
}
