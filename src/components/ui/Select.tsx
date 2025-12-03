import { forwardRef } from 'react';
import { cn } from '@/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            label,
            error,
            hint,
            options,
            onChange,
            id,
            ...props
        },
        ref
    ) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-foreground mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            'w-full h-10 px-3 pr-10 text-sm appearance-none',
                            'bg-background text-foreground',
                            'border border-border rounded-md',
                            'transition-colors duration-150',
                            'hover:border-border-hover',
                            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error && 'border-error focus:ring-error',
                            className
                        )}
                        onChange={(e) => onChange?.(e.target.value)}
                        {...props}
                    >
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
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

Select.displayName = 'Select';

export { Select };
