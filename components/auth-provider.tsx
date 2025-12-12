"use client"

import { NeonAuthUIProvider, UserButton } from '@neondatabase/neon-js/auth/react/ui';
import { authClient } from '@/lib/auth-client';


export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      redirectTo="/dashboard"
      emailOTP
      social={{  
        providers: ['google']  
        }} 
    >
      {children}
    </NeonAuthUIProvider>
  );
}

