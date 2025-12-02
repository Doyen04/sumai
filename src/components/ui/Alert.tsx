import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/utils';
import { Button } from './Button';

export interface AlertProps {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    children: React.ReactNode;
    onClose?: () => void;
    className?: string;
}

export function Alert({
    variant = 'info',
    title,
    children,
    onClose,
    className,
}: AlertProps) {
    const variants = {
        info: {
            container: 'bg-accent-light border-accent/20',
            icon: Info,
            iconColor: 'text-accent',
        },
        success: {
            container: 'bg-success-light border-success/20',
            icon: CheckCircle,
            iconColor: 'text-success',
        },
        warning: {
            container: 'bg-warning-light border-warning/20',
            icon: AlertTriangle,
            iconColor: 'text-warning',
        },
        error: {
            container: 'bg-error-light border-error/20',
            icon: AlertCircle,
            iconColor: 'text-error',
        },
    };

    const currentVariant = variants[variant];
    const Icon = currentVariant.icon;

    return (
        <div
            role="alert"
            className={cn(
                'flex gap-3 p-4 rounded-lg border',
                currentVariant.container,
                className
            )}
        >
            <Icon className={cn('w-5 h-5 shrink-0', currentVariant.iconColor)} />
            <div className="flex-1 min-w-0">
                {title && (
                    <h5 className="text-sm font-semibold text-foreground mb-1">
                        {title}
                    </h5>
                )}
                <div className="text-sm text-muted">{children}</div>
            </div>
            {onClose && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-6 w-6 p-0 -mr-1 -mt-1"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
