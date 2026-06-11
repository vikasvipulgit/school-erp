import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Star, Search, AlertCircle, Loader2 } from 'lucide-react';
import { getAchievements } from '@/modules/achievements/services/achievementService';

const categoryColors = {
  Academic:    'bg-blue-100 text-blue-700',
  Sports:      'bg-orange-100 text-orange-700',
  Science:     'bg-purple-100 text-purple-700',
  Attendance:  'bg-green-100 text-green-700',
  Competition: 'bg-red-100 text-red-700',
  School:      'bg-indigo-100 text-indigo-700',
  Arts:        'bg-pink-100 text-pink-700',
};

const getCategoryColor = (cat) => categoryColors[cat] || 'bg-gray-100 text-gray-700';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function StudentAchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    getAchievements()
      .then((data) => {
        setAchievements(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load achievements. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(achievements.map((a) => a.category).filter(Boolean))];

  const filteredAchievements = achievements.filter((a) => {
    const matchesSearch =
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || a.category === filter;
    return matchesSearch && matchesFilter;
  });

  const featured = filteredAchievements[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="text-red-500 shrink-0" size={24} />
          <div>
            <p className="font-semibold text-red-700">Error loading achievements</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Achievements</h1>
        <p className="text-gray-500 text-sm mt-1">Track your academic and extracurricular accomplishments</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Achievements', value: achievements.length, icon: Trophy, color: 'text-yellow-600' },
          { label: 'Academic Awards',    value: achievements.filter((a) => a.category === 'Academic').length, icon: Award, color: 'text-blue-600' },
          { label: 'Competition Wins',   value: achievements.filter((a) => a.category === 'Competition').length, icon: Medal, color: 'text-red-600' },
          {
            label: 'Certificates Earned',
            value: achievements.filter((a) => ['Attendance', 'School', 'Science', 'Arts'].includes(a.category)).length,
            icon: Star, color: 'text-green-600'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Achievement */}
      {featured && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-100 relative overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-10 text-yellow-200/50">
            <Trophy size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <Trophy size={32} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Latest Achievement</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{featured.title}</h2>
              <p className="text-gray-600 text-sm max-w-2xl">{featured.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search achievements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Achievements Timeline/List */}
      {achievements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No achievements yet</h3>
          <p className="text-gray-500 text-sm mt-1">Your achievements will appear here once they are awarded.</p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No achievements found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            filteredAchievements.map((item) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Medal size={16} />
                </div>

                {/* Card */}
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      {item.level && (
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{item.level}</span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-500">{formatDate(item.awardedOn || item.createdAt)}</div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                  {item.badge && (
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-700">{item.badge}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
