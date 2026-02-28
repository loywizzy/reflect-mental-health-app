import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-sage-100 bg-white p-6 shadow-sm',
                hover && 'transition-shadow hover:shadow-md',
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('mb-4 flex items-center justify-between', className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
}

export function CardTitle({ children, className, icon }: CardTitleProps) {
    return (
        <h3 className={cn('flex items-center gap-2 text-lg font-semibold text-gray-800', className)}>
            {icon}
            {children}
        </h3>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return <div className={cn('', className)}>{children}</div>;
}
