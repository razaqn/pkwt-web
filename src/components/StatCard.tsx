import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconBgColor: string;
    iconColor: string;
    percentage?: number;
    percentageColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    iconBgColor,
    iconColor,
    percentage,
    percentageColor = 'text-green-500',
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 font-medium uppercase">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${iconBgColor}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
            </div>
            {percentage !== undefined && (
                <div className="mt-4">
                    <span className={`text-sm font-medium ${percentageColor}`}>
                        {percentage > 0 ? '↑' : '↓'} {Math.abs(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default StatCard;