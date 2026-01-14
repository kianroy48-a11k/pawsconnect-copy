import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import MobileNav from '@/components/navigation/MobileNav';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (e) {
      console.error('Auth check failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Pages that don't need auth - none for this app, all require login
  const publicPages = [];
  const isPublicPage = publicPages.includes(currentPageName);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 animate-pulse" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Landing page - no layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!user && !isPublicPage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pawbook</h1>
          <p className="text-gray-500 mb-6">The social network for pet lovers. Connect, share, and discover.</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar currentPage={currentPageName} user={user} />
      </div>

      {/* Main Content */}
      <main className="md:ml-[68px] xl:ml-[260px] pb-20 md:pb-0">
        {React.cloneElement(children, { user })}
      </main>

      {/* Mobile Navigation */}
      <MobileNav currentPage={currentPageName} />
    </div>
  );
}