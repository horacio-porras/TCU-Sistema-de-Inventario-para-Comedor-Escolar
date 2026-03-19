"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        const redirectUrl = `/login?next=${encodeURIComponent(pathname || "/dashboard")}`;
        router.replace(redirectUrl);
        return;
      }

      setIsCheckingSession(false);
    });

    return unsubscribe;
  }, [pathname, router]);

  if (isCheckingSession) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  return <>{children}</>;
}
