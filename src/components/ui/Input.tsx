import { forwardRef } from 'react';
import { cn } from '@/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            hint,
            leftElement,
            rightElement,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-foreground mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftElement && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                            {leftElement}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'w-full h-10 px-3 text-sm',
                            'bg-white text-foreground placeholder:text-muted-foreground',
                            'border border-border rounded-md',
                            'transition-colors duration-150',
                            'hover:border-border-hover',
                            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error && 'border-error focus:ring-error',
                            leftElement && 'pl-10',
                            rightElement && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {rightElement && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                            {rightElement}
                        </div>
                    )}
                </div>
                {(error || hint) && (
                    <p
                        className={cn(
                            'mt-1.5 text-sm',
                            error ? 'text-error' : 'text-muted'
                        )}
                    >
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
