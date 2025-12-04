import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { ContractStatusData } from '../types/chartTypes';

ChartJS.register(ArcElement, Tooltip, Legend);

interface EmployeeContractStatusChartProps {
    data: ContractStatusData;
}

const EmployeeContractStatusChart: React.FC<EmployeeContractStatusChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Contract Status</h3>
            <div className="flex items-center justify-center h-64">
                <Pie
                    data={data}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                                        const percentage = Math.round((Number(value) / total) * 100);
                                        return `${label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default EmployeeContractStatusChart;