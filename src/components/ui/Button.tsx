import { forwardRef } from 'react';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-md
      transition-colors duration-150
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
      disabled:pointer-events-none disabled:opacity-50
    `;

        const variants = {
            primary: `
        bg-accent text-white
        hover:bg-accent-hover
        active:bg-accent-hover
      `,
            secondary: `
        bg-background text-foreground
        border border-border
        hover:bg-surface-hover hover:border-border-hover
        active:bg-surface
      `,
            ghost: `
        bg-transparent text-foreground
        hover:bg-surface-hover
        active:bg-surface
      `,
            danger: `
        bg-error text-white
        hover:bg-red-700
        active:bg-red-800
      `,
        };

        const sizes = {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4 text-sm',
            lg: 'h-12 px-6 text-base',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
