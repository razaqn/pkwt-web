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
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold text-slate-800">{title}</div>
                <p className="mt-1 text-slate-600">{welcomeText}</p>
            </div>
            {children || (
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="rounded-xl border bg-white p-6 shadow-sm h-40"></div>
                    <div className="rounded-xl border bg-white p-6 shadow-sm h-40"></div>
                    <div className="rounded-xl border bg-white p-6 shadow-sm h-40"></div>
                </div>
            )}
        </div>
    );
}