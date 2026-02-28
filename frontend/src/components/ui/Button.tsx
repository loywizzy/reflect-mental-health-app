import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    ...props
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-sage-600 text-white hover:bg-sage-700 active:bg-sage-800',
        secondary: 'bg-sage-100 text-sage-800 hover:bg-sage-200 active:bg-sage-300',
        ghost: 'text-sage-700 hover:bg-sage-50 active:bg-sage-100',
        outline: 'border-2 border-sage-300 text-sage-700 hover:bg-sage-50 active:bg-sage-100',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-7 py-3.5 text-lg',
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
