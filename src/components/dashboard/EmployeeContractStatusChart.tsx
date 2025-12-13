import { Pie } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ContractStatusChartProps {
    data?: {
        pkwt: number;
        pkwtt: number;
    };
}

export default function EmployeeContractStatusChart({ data }: ContractStatusChartProps) {
    // Mock data - will be replaced with API data
    const mockData = data || {
        pkwt: 45,
        pkwtt: 55
    };

    const chartData = {
        labels: ['PKWT', 'PKWTT'],
        datasets: [
            {
                data: [mockData.pkwt, mockData.pkwtt],
                backgroundColor: [
                    '#3B82F6', // Blue for PKWT
                    '#06B6D4', // Cyan for PKWTT
                ],
                borderWidth: 0,
            },
        ],
    };

    const options: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 13,
                    },
                    generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels?.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const backgrounds = data.datasets[0].backgroundColor as string[];
                                return {
                                    text: `${label} (${value}%)`,
                                    fillStyle: backgrounds[i],
                                    hidden: false,
                                    index: i,
                                };
                            });
                        }
                        return [];
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return ` ${context.label}: ${context.parsed}%`;
                    },
                },
            },
        },
    };

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribusi Tipe Kontrak</h3>
            <div style={{ height: '280px' }}>
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
}
