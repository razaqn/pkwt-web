import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface NewContractsChartProps {
    data?: {
        labels: string[];
        values: number[];
    };
}

export default function NewContractsChart({ data }: NewContractsChartProps) {
    const BRAND_PRIMARY = '#419823';
    const BRAND_PRIMARY_FILL = 'rgba(65, 152, 35, 0.12)';

    const mockData = data || {
        labels: ['Jan-Jun', 'February', 'March', 'April', 'May', 'Jun-Jun'],
        values: [21, 54, 35, 76, 57, 93]
    };

    const chartData = {
        labels: mockData.labels,
        datasets: [
            {
                label: 'New Contracts',
                data: mockData.values,
                borderColor: BRAND_PRIMARY,
                backgroundColor: BRAND_PRIMARY_FILL,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: BRAND_PRIMARY,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#334155',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (context) => {
                        return `Contracts: ${context.parsed.y}`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 20,
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    color: '#f1f5f9',
                },
            },
            x: {
                ticks: {
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Kontrak Baru per Bulan</h3>
            </div>
            <div className="p-5" style={{ height: '280px' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
