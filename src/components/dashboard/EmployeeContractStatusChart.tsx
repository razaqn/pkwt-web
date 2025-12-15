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
    const BRAND_PRIMARY = '#419823';
    const BRAND_SECONDARY = '#F4D348';

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
                    BRAND_PRIMARY,
                    BRAND_SECONDARY,
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
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
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Distribusi Tipe Kontrak</h3>
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND_PRIMARY }} />
                        PKWT
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND_SECONDARY }} />
                        PKWTT
                    </span>
                </div>
            </div>
            <div className="p-5" style={{ height: '280px' }}>
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
}
