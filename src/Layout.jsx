import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import MobileNav from '@/components/navigation/MobileNav';
import AIChatbot from '@/components/common/AIChatbot';
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Logo Animation */}
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mx-auto shadow-xl shadow-orange-200">
              <span className="text-4xl">🐾</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Pawbook</h1>
          <p className="text-gray-500 mb-8 text-lg leading-relaxed">
            The social network for pet lovers. Connect with fellow pet parents, share adorable moments, and discover local services.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <span className="text-2xl mb-1 block">🏠</span>
              <span className="text-xs text-gray-500">Adoption</span>
            </div>
            <div className="text-center">
              <span className="text-2xl mb-1 block">🏥</span>
              <span className="text-xs text-gray-500">Find Vets</span>
            </div>
            <div className="text-center">
              <span className="text-2xl mb-1 block">🏆</span>
              <span className="text-xs text-gray-500">Challenges</span>
            </div>
          </div>
          
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-orange-200 text-lg"
          >
            Get Started
          </button>
          
          <p className="text-xs text-gray-400 mt-4">
            Sign in with your Google account to continue
          </p>
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

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
  }