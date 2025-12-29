import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole, getToken, clearAuth } from '../store/auth';
import { API_BASE } from '../lib/api';

const POLL_INTERVAL = 30000; // 30 seconds

/**
 * Hook to validate admin session periodically.
 * If session is invalidated (login from another device), returns showModal = true.
 * Only runs for super_admin and disnaker roles.
 */
export function useSessionValidator() {
    const navigate = useNavigate();
    const intervalRef = useRef<number | null>(null);
    const [showInvalidatedModal, setShowInvalidatedModal] = useState(false);

    const validateSession = useCallback(async () => {
        const token = getToken();
        const role = getRole();

        // Only validate for admin roles
        if (!token || (role !== 'super_admin' && role !== 'disnaker')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/session/validate`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const json = await res.json().catch(() => null);
                // Check if session was invalidated
                if (json?.code === 'SESSION_INVALIDATED' || res.status === 401) {
                    clearAuth();
                    setShowInvalidatedModal(true);
                }
            }
        } catch {
            // Network error, ignore - will retry on next poll
        }
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowInvalidatedModal(false);
        navigate('/login/admin', { replace: true });
    }, [navigate]);

    useEffect(() => {
        const role = getRole();

        // Only start polling for admin roles
        if (role !== 'super_admin' && role !== 'disnaker') {
            return;
        }

        // Initial check after short delay (let page render first)
        const initialTimeout = setTimeout(validateSession, 2000);

        // Start polling
        intervalRef.current = window.setInterval(validateSession, POLL_INTERVAL);

        return () => {
            clearTimeout(initialTimeout);
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [validateSession]);

    return { showInvalidatedModal, handleCloseModal };
}
