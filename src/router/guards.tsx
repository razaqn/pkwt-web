import { Navigate } from 'react-router-dom';
import { getToken, getRole } from '../store/auth';
import type { JSX } from 'react';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const isAuthed = Boolean(getToken());
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

export function RequireGuest({ children }: { children: JSX.Element }) {
  const isAuthed = Boolean(getToken());
  if (isAuthed) return <Navigate to="/dashboard" replace />;
  return children;
}

export function RequireRole({ children, roles }: { children: JSX.Element; roles: string[] }) {
  const isAuthed = Boolean(getToken());
  const role = getRole();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (role && !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}
