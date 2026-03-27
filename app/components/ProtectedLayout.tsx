'use client';

import React, { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isAuthenticated = status === 'authenticated';

  const publicPages = ['/login', '/register', '/forgot-password', '/about', '/catalogue', '/locations', '/guides'];
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
      dispatch({ type: 'LOGOUT' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  }, [session, status, dispatch]);

  const hideFooter = ['/login', '/register', '/forgot-password'].includes(pathname);
  const showContent = isPublicPage || isAuthenticated;

  // Always render children in the DOM to preserve layout dimensions.
  // Use opacity instead of invisible to avoid any reflow.
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* pt offsets the fixed navbar: 64px header on mobile, 64+36=100px on desktop (header+yellow nav) */}
      <main className="flex-1 flex flex-col pt-[64px] md:pt-[100px]">
        <div className="flex-1 flex flex-col" style={{ opacity: showContent ? 1 : 0 }}>
          {children}
        </div>
        {!showContent && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-30" style={{ top: '64px' }}>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#f5a623]"></div>
          </div>
        )}
      </main>
      {!hideFooter && <Footer />}
      <ScrollToTop />
    </div>
  );
}
