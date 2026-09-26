'use client';

import React from 'react';
import { AuthProvider } from '@/lib/admin/auth';
import { ToastProvider } from '@/components/admin/ui/Toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
