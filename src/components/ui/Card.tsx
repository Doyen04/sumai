import { cn } from '@/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
    className,
    variant = 'default',
    padding = 'md',
    children,
    ...props
}: CardProps) {
    const baseStyles = 'rounded-lg transition-shadow duration-150';

    const variants = {
        default: 'bg-white border border-border',
        elevated: 'bg-white shadow-md',
        outlined: 'bg-transparent border border-border',
    };

    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    return (
        <div
            className={cn(baseStyles, variants[variant], paddings[padding], className)}
            {...props}
        >
            {children}
        </div>
    );
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
    return (
        <div className={cn('mb-4', className)} {...props}>
            {children}
        </div>
    );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({
    className,
    as: Component = 'h3',
    children,
    ...props
}: CardTitleProps) {
    return (
        <Component
            className={cn('text-lg font-semibold text-foreground', className)}
            {...props}
        >
            {children}
        </Component>
    );
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
    return (
        <p className={cn('text-sm text-muted mt-1', className)} {...props}>
            {children}
        </p>
    );
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, children, ...props }: CardContentProps) {
    return (
        <div className={cn('', className)} {...props}>
            {children}
        </div>
    );
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, children, ...props }: CardFooterProps) {
    return (
        <div className={cn('mt-4 flex items-center gap-2', className)} {...props}>
            {children}
        </div>
    );
}
