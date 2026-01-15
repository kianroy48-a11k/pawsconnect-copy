import React, { useEffect, useState } from 'react';
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
      {/* Main Content */}
      <main className="pb-20 md:pb-0">
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