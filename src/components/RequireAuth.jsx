import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session ?? null);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { mounted = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  if (checking) return null;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}


