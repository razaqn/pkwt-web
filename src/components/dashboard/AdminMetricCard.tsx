import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AdminMetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconBgColor: string;
    iconColor: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function AdminMetricCard({
    title,
    value,
    icon: Icon,
    iconBgColor,
    iconColor,
    trend
}: AdminMetricCardProps) {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                    {trend && (
                        <div className="mt-2 flex items-center gap-1">
                            {trend.isPositive ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                        </div>
                    )}
                </div>
                <div className={`rounded-lg ${iconBgColor} p-3`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}
