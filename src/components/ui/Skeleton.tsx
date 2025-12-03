import { cn } from '@/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    lines?: number;
}

export function Skeleton({
    className,
    variant = 'text',
    width,
    height,
    lines = 1,
    ...props
}: SkeletonProps) {
    const baseStyles = 'skeleton bg-surface rounded';

    const variants = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    };

    const style: React.CSSProperties = {
        width: width,
        height: height,
    };

    if (variant === 'text' && lines > 1) {
        return (
            <div className={cn('space-y-2', className)} {...props}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(baseStyles, variants.text)}
                        style={{
                            ...style,
                            width: i === lines - 1 ? '75%' : width || '100%',
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(baseStyles, variants[variant], className)}
            style={style}
            {...props}
        />
    );
}

// Skeleton for document cards
export function DocumentCardSkeleton() {
    return (
        <div className="p-4 bg-background border border-border rounded-lg">
            <div className="flex items-start gap-3">
                <Skeleton variant="rectangular" width={40} height={40} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                </div>
            </div>
        </div>
    );
}

// Skeleton for summary content
export function SummarySkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" lines={3} />
            <Skeleton variant="text" width="50%" height={20} />
            <Skeleton variant="text" lines={4} />
            <Skeleton variant="text" width="35%" height={20} />
            <Skeleton variant="text" lines={2} />
        </div>
    );
}

// Skeleton for document viewer
export function DocumentViewerSkeleton() {
    return (
        <div className="space-y-4 p-4">
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" lines={6} />
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" lines={8} />
            <Skeleton variant="text" width="55%" height={24} />
            <Skeleton variant="text" lines={5} />
        </div>
    );
}
