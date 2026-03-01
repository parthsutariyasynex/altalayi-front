'use client';

import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Sidebar from './Sidebar';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // Public pages that don't need Sidebar or authentication
  const publicPages = ['/login', '/register', '/forgot-password'];
  const isPublicPage = publicPages.includes(pathname);

  // Sync NextAuth session with Redux & LocalStorage
  useEffect(() => {
    if (status === 'authenticated' && (session as any)?.accessToken) {
      const token = (session as any).accessToken;
      dispatch({ type: 'LOGIN_SUCCESS', payload: token });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    } else if (status === 'unauthenticated') {
      // Clear Redux token & localStorage when session ends
      dispatch({ type: 'LOGOUT' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  }, [session, status, dispatch]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPage) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, isPublicPage, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 bg-gray-50">
        {/* Sidebar only for protected pages */}
        {isAuthenticated && !isPublicPage && (
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* For public pages, show children immediately. For protected, only show if authenticated */}
          {(isPublicPage || isAuthenticated) ? (
            <main className={isAuthenticated && !isPublicPage ? "p-6 lg:p-8" : ""}>
              {children}
            </main>
          ) : (
            // This case handles the split second before the router.replace kicks in
            <div className="flex-1 flex items-center justify-center">
              <p>Redirecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}