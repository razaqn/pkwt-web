import { API_BASE } from './api';

export function resolveUploadUrl(path?: string | null): string | null {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${normalized}`;
}
