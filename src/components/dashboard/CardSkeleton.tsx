export function CardSkeleton() {
    return (
        <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
            <div className="h-3 w-full animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
            <div className="h-3 w-5/6 animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
            <div className="h-3 w-2/3 animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
        </div>
    );
}
