import { useState, useMemo, useEffect } from 'react';
import { Megaphone, Calendar, Search, Tag, Bell, Loader2 } from 'lucide-react';
import { getCirculars } from '@/modules/circulars/services/circularService';

const CATEGORY_COLORS = {
  Holiday:     { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
  Examination: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-400'     },
  Event:       { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-400'  },
  Fees:        { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-400'  },
  Library:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  Meeting:     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400'    },
  General:     { bg: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200',    dot: 'bg-gray-400'    },
};

const ALL_CATEGORIES = ['All', ...Object.keys(CATEGORY_COLORS)];
const LATEST_HOURS = 48; // Circulars within 48 hours get a "NEW" badge

export default function StudentCircularsPage() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [query, setQuery]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    getCirculars()
      .then(data => setCirculars(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load circulars. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const isNew = (createdAt) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return diffMs < LATEST_HOURS * 60 * 60 * 1000;
  };

  const filtered = useMemo(() => {
    return circulars.filter((c) => {
      const matchesQuery =
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [circulars, query, activeCategory]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <Megaphone size={24} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Circulars &amp; Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Important updates shared by the school administration
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search circulars..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Count */}
      {!loading && !error && (
        <p className="text-xs text-gray-400 font-medium">
          Showing {filtered.length} of {circulars.length} circulars
        </p>
      )}

      {/* Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Bell size={40} className="mb-3 text-gray-200" />
              <p className="text-sm">
                {circulars.length === 0 ? 'No circulars published yet.' : 'No circulars match your filters.'}
              </p>
            </div>
          ) : (
            filtered.map((circular) => {
              const colors = CATEGORY_COLORS[circular.category] || CATEGORY_COLORS.General;
              const newBadge = isNew(circular.createdAt);
              const formattedDate = new Date(circular.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <div
                  key={circular.id}
                  className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          <Tag size={10} />
                          {circular.category}
                        </span>
                        {newBadge && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                            NEW
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                          <Calendar size={12} />
                          {formattedDate}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug mb-1.5">
                        {circular.title}
                      </h2>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {circular.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
