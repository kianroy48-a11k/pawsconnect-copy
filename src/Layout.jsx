import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import MobileNav from '@/components/navigation/MobileNav';
import AIChatbot from '@/components/common/AIChatbot';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  // Clone children and pass user prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user });
    }
    return child;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar user={user} currentPage={currentPageName} />
      </div>

      {/* Main Content */}
      <main className="md:ml-20 lg:ml-64 pb-20 md:pb-0">
        {childrenWithProps}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav currentPage={currentPageName} />
      </div>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}