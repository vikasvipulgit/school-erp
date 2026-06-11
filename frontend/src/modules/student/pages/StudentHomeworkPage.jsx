import React, { useState, useMemo } from 'react';
import { BookOpen, Search, CheckCircle2, Clock, AlertCircle, FileText, Download } from 'lucide-react';
import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';

const mockHomework = [
  {
    id: 1,
    subject: "Mathematics",
    title: "Algebra Practice Worksheet",
    description: "Complete exercises 5 to 10 from Chapter 4 in notebook.",
    assignedDate: "29 May 2026",
    dueDate: "31 May 2026",
    status: "Pending",
    teacher: "Aditi Verma"
  },
  {
    id: 2,
    subject: "Science",
    title: "Solar System Diagram",
    description: "Prepare a labeled solar system chart for class presentation.",
    assignedDate: "28 May 2026",
    dueDate: "2 June 2026",
    status: "Pending",
    teacher: "Ajay Singh"
  },
  {
    id: 3,
    subject: "English",
    title: "Essay Writing",
    description: "Write an essay on 'Importance of Discipline' (500 words).",
    assignedDate: "27 May 2026",
    dueDate: "30 May 2026",
    status: "Completed",
    teacher: "Sneha Gupta"
  },
  {
    id: 4,
    subject: "Computer",
    title: "HTML Basics",
    description: "Create a simple HTML page with headings and tables.",
    assignedDate: "25 May 2026",
    dueDate: "29 May 2026",
    status: "Overdue",
    teacher: "Rahul Mehta"
  },
  {
    id: 5,
    subject: "Social Science",
    title: "History Notes",
    description: "Complete Chapter 3 notes and revise important events.",
    assignedDate: "24 May 2026",
    dueDate: "28 May 2026",
    status: "Completed",
    teacher: "Priya Sharma"
  }
];

const FILTERS = ['All', 'Pending', 'Completed', 'Overdue'];

function getStatusStyle(status) {
  switch (status) {
    case 'Completed': return { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={14} />, border: 'border-emerald-200' };
    case 'Pending': return { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock size={14} />, border: 'border-amber-200' };
    case 'Overdue': return { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle size={14} />, border: 'border-red-200' };
    default: return { bg: 'bg-gray-50', text: 'text-gray-700', icon: null, border: 'border-gray-200' };
  }
}

export default function StudentHomeworkPage() {
  const [homeworkList, setHomeworkList] = useState(mockHomework);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredHomework = useMemo(() => {
    return homeworkList.filter(hw => {
      const matchSearch = hw.title.toLowerCase().includes(query.toLowerCase()) || hw.subject.toLowerCase().includes(query.toLowerCase());
      const matchFilter = activeFilter === 'All' || hw.status === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [homeworkList, query, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: homeworkList.length,
      pending: homeworkList.filter(hw => hw.status === 'Pending').length,
      completed: homeworkList.filter(hw => hw.status === 'Completed').length,
      overdue: homeworkList.filter(hw => hw.status === 'Overdue').length,
    };
  }, [homeworkList]);

  const toggleStatus = (id) => {
    setHomeworkList(prev => prev.map(hw => {
      if (hw.id === id) {
        if (hw.status === 'Pending' || hw.status === 'Overdue') return { ...hw, status: 'Completed' };
        if (hw.status === 'Completed') return { ...hw, status: 'Pending' };
      }
      return hw;
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader 
        title="My Homework"
        description="Track pending and completed homework assignments"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm flex flex-col justify-between border-l-4 border-blue-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Homework</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm border-l-4 border-amber-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Pending</div>
          <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm border-l-4 border-emerald-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Completed</div>
          <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm border-l-4 border-red-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Overdue</div>
          <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subject or title..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHomework.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed flex flex-col items-center">
            <BookOpen size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium">No homework found.</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredHomework.map(hw => {
            const statusStyle = getStatusStyle(hw.status);
            
            return (
              <Card key={hw.id} className="flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      <BookOpen size={12} />
                      {hw.subject}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      {statusStyle.icon}
                      {hw.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{hw.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{hw.description}</p>
                </div>
                
                {/* Meta details */}
                <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Assigned:</span>
                    <span>{hw.assignedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Due Date:</span>
                    <span className={hw.status === 'Overdue' ? 'text-red-600 font-bold' : ''}>{hw.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Teacher:</span>
                    <span>{hw.teacher}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="p-4 flex items-center justify-between gap-3 bg-white">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Download size={14} />
                    Material
                  </button>
                  <button 
                    onClick={() => toggleStatus(hw.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      hw.status === 'Completed' 
                        ? 'text-gray-600 bg-gray-100 hover:bg-gray-200' 
                        : 'text-white bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {hw.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
