import React, { useState } from 'react';
import { Book, FileText, Search, Download, ChevronDown, ChevronUp, CheckCircle, Circle, Target, BookOpen, Layers } from 'lucide-react';

const syllabusData = [
  {
    id: 1,
    subject: "Mathematics",
    teacher: "Aditi Verma",
    completion: 75,
    chapters: [
      "Algebra",
      "Linear Equations",
      "Trigonometry",
      "Mensuration"
    ],
    totalChapters: 8,
    completedChapters: 6,
    pdf: "#"
  },
  {
    id: 2,
    subject: "Science",
    teacher: "Ajay Singh",
    completion: 60,
    chapters: [
      "Physics Basics",
      "Chemical Reactions",
      "Human Body"
    ],
    totalChapters: 10,
    completedChapters: 6,
    pdf: "#"
  },
  {
    id: 3,
    subject: "English",
    teacher: "Sneha Gupta",
    completion: 85,
    chapters: [
      "Grammar",
      "Essay Writing",
      "Poetry",
      "Reading Comprehension"
    ],
    totalChapters: 7,
    completedChapters: 6,
    pdf: "#"
  },
  {
    id: 4,
    subject: "Computer",
    teacher: "Rahul Mehta",
    completion: 50,
    chapters: [
      "HTML",
      "CSS",
      "JavaScript Basics"
    ],
    totalChapters: 6,
    completedChapters: 3,
    pdf: "#"
  }
];

export default function StudentSyllabusPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All'); // All, Completed (>80), In Progress (50-80), Pending (<50)
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({...prev, [id]: !prev[id]}));
  };

  const filteredData = syllabusData.filter(s => {
    const matchesSearch = s.subject.toLowerCase().includes(search.toLowerCase());
    let matchesFilter = true;
    if (filter === 'Completed') matchesFilter = s.completion > 80;
    if (filter === 'In Progress') matchesFilter = s.completion >= 50 && s.completion <= 80;
    if (filter === 'Pending') matchesFilter = s.completion < 50;
    return matchesSearch && matchesFilter;
  });

  const totalSubjects = syllabusData.length;
  const overallCompletion = Math.round(syllabusData.reduce((acc, curr) => acc + curr.completion, 0) / totalSubjects);
  const totalCompletedChapters = syllabusData.reduce((acc, curr) => acc + curr.completedChapters, 0);
  const totalRemainingChapters = syllabusData.reduce((acc, curr) => acc + (curr.totalChapters - curr.completedChapters), 0);

  const getProgressColor = (completion) => {
    if (completion > 80) return 'text-green-500 bg-green-500';
    if (completion >= 50) return 'text-blue-500 bg-blue-500';
    return 'text-orange-500 bg-orange-500';
  };
  
  const getProgressBg = (completion) => {
    if (completion > 80) return 'bg-green-100';
    if (completion >= 50) return 'bg-blue-100';
    return 'bg-orange-100';
  };

  const getProgressStroke = (completion) => {
    if (completion > 80) return '#22c55e';
    if (completion >= 50) return '#3b82f6';
    return '#f97316';
  };

  const mostCompleted = [...syllabusData].sort((a, b) => b.completion - a.completion)[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Syllabus</h1>
        <p className="text-gray-500 text-sm mt-1">Track subject-wise syllabus and academic progress</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Subjects', value: totalSubjects, icon: BookOpen, color: 'text-indigo-600' },
          { label: 'Overall Completion', value: `${overallCompletion}%`, icon: Target, color: 'text-green-600' },
          { label: 'Completed Chapters', value: totalCompletedChapters, icon: CheckCircle, color: 'text-blue-600' },
          { label: 'Remaining Chapters', value: totalRemainingChapters, icon: Layers, color: 'text-orange-600' }
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

      {/* Most Completed Subject Highlight */}
      {mostCompleted && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="absolute -right-10 -top-10 text-blue-200/50">
             <Target size={150} />
          </div>
          <div className="relative z-10 w-20 h-20 shrink-0">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-blue-200 stroke-current"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600 stroke-current drop-shadow-md transition-all duration-1000 ease-out"
                strokeWidth="3"
                strokeDasharray={`${mostCompleted.completion}, 100`}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-800">{mostCompleted.completion}%</span>
            </div>
          </div>
          <div className="relative z-10 flex-1 text-center md:text-left">
             <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Most Progress Made</div>
             <h2 className="text-xl font-bold text-gray-900">{mostCompleted.subject}</h2>
             <p className="text-sm text-gray-600 mt-1">You are doing great in this subject with {mostCompleted.completedChapters} out of {mostCompleted.totalChapters} chapters completed.</p>
          </div>
          <div className="relative z-10">
             <button className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
               View Full Syllabus
             </button>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All', 'Completed', 'In Progress', 'Pending'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Search subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Syllabus Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
             <FileText size={48} className="mx-auto text-gray-300 mb-4" />
             <h3 className="text-lg font-medium text-gray-900">No syllabus found</h3>
             <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filteredData.map(subject => {
            const isExpanded = expandedCards[subject.id];
            const colorClass = getProgressColor(subject.completion);
            const bgColorClass = getProgressBg(subject.completion);
            const strokeColor = getProgressStroke(subject.completion);

            return (
              <div key={subject.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="text-lg font-bold text-gray-900">{subject.subject}</h3>
                       <p className="text-sm text-gray-500">Teacher: {subject.teacher}</p>
                     </div>
                     <div className="w-12 h-12 relative shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-100 stroke-current"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            stroke={strokeColor}
                            strokeWidth="3"
                            strokeDasharray={`${subject.completion}, 100`}
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-[10px] font-bold ${colorClass.split(' ')[0]}`}>{subject.completion}%</span>
                        </div>
                     </div>
                   </div>

                   <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{subject.completedChapters} / {subject.totalChapters} Chapters</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                         <div className={`h-2 rounded-full ${colorClass.split(' ')[1]} transition-all duration-1000 ease-out`} style={{ width: `${subject.completion}%` }}></div>
                      </div>
                   </div>

                   <div className="flex gap-2">
                     <button 
                       onClick={() => toggleExpand(subject.id)}
                       className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200"
                     >
                       {isExpanded ? 'Hide Chapters' : 'View Chapters'}
                       {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                     </button>
                     <button className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-blue-600 text-sm font-medium rounded-lg transition-colors border border-gray-200">
                       <Download size={16} />
                       PDF
                     </button>
                   </div>
                </div>

                {/* Expandable Chapter List */}
                <div className={`border-t border-gray-50 bg-gray-50/50 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-y-auto`}>
                  <div className="p-5 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chapters Outline</h4>
                    {subject.chapters.map((chapter, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {idx < subject.completedChapters ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Circle size={16} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${idx < subject.completedChapters ? 'text-gray-900' : 'text-gray-500'}`}>
                            {idx + 1}. {chapter}
                          </div>
                          {idx < subject.completedChapters && (
                            <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">Completed</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {subject.chapters.length < subject.totalChapters && (
                      <div className="text-xs text-gray-400 italic mt-2 ml-7">
                        + {subject.totalChapters - subject.chapters.length} more chapters...
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
