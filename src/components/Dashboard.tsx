import type { ReactNode } from "react";

interface DashboardProps {
    title?: string;
    welcomeText?: string;
    children?: ReactNode;
}

export default function Dashboard({
    title = "Selamat Datang di E-PKWT!",
    welcomeText = "Bagian utama akan dibuat kemudian.",
    children
}: DashboardProps) {
    return (
        <div className="grid gap-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold text-slate-800">{title}</div>
                <p className="mt-1 text-slate-600">{welcomeText}</p>
            </div>

            {children || (
                <div className="space-y-6">
                    {/* Statistics Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array(4).fill(0).map((_, index) => (
                            <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-32"></div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-80"></div>
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-80"></div>
                    </div>
                </div>
            )}
        </div>
    );
}