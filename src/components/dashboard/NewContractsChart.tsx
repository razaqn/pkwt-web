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
    // Mock data - will be replaced with API data
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
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#3B82F6',
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
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Kontrak Baru per Bulan</h3>
            <div style={{ height: '280px' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
