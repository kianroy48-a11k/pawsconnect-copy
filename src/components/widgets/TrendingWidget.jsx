import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Flame, ChevronRight, Bell, Moon, Sun } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TrendingWidget() {
  const [challenges, setChallenges] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadChallenges();
    // Check for saved dark mode preference
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const loadChallenges = async () => {
    try {
      const data = await base44.entities.Challenge.filter({ is_active: true }, '-participants_count', 5);
      setChallenges(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="bg-blue-50/50 rounded-2xl p-4 text-left">
      <div className="flex items-start gap-2 mb-4">
        <Flame className="w-5 h-5 text-blue-400 mt-0.5" />
        <h3 className="font-semibold text-gray-800">Trending Challenges</h3>
      </div>
      
      <div className="space-y-3">
        {challenges.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No active challenges</p>
        ) : (
          challenges.map((challenge) => (
            <Link
              key={challenge.id}
              to={createPageUrl(`Challenges?id=${challenge.id}`)}
              className="block p-3 bg-white rounded-xl hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">{challenge.title}</p>
                  <p className="text-xs text-blue-500 mt-0.5">#{challenge.hashtag}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{challenge.participants_count || 0} entries</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      <Link 
        to={createPageUrl('Challenges')}
        className="flex items-center justify-center gap-1 mt-4 text-sm text-blue-400 hover:text-blue-500 transition"
      >
        <span>View all challenges</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}