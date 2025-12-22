import { Navigate } from 'react-router-dom';
import { getToken } from '../store/auth';
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
