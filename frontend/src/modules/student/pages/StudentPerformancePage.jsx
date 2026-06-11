import React from 'react';
import { BarChart3, TrendingUp, Trophy, Award, Download, ChevronRight } from 'lucide-react';

const performanceSummary = {
  overallPercentage: 88,
  classRank: 5,
  totalStudents: 42,
  examsAttempted: 4,
  highestSubject: "Mathematics",
  weakestSubject: "Science"
};

const subjectPerformance = [
  { subject: "Mathematics", marks: 95, total: 100, grade: "A+" },
  { subject: "Science", marks: 76, total: 100, grade: "B+" },
  { subject: "English", marks: 89, total: 100, grade: "A" },
  { subject: "Computer", marks: 93, total: 100, grade: "A+" },
  { subject: "Social Science", marks: 84, total: 100, grade: "A" }
];

const examHistory = [
  { exam: "Unit Test 1", percentage: 82 },
  { exam: "Unit Test 2", percentage: 85 },
  { exam: "Mid Term", percentage: 88 },
  { exam: "Pre Finals", percentage: 91 }
];

export default function StudentPerformancePage() {
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return { text: "text-green-600", bg: "bg-green-500", label: "Excellent Performance" };
    if (percentage >= 75) return { text: "text-blue-600", bg: "bg-blue-500", label: "Good Progress" };
    return { text: "text-orange-600", bg: "bg-orange-500", label: "Needs Improvement" };
  };

  const status = getStatusColor(performanceSummary.overallPercentage);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={24} />
            My Performance
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your academic growth and subject-wise performance</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} />
          Download Report Card
        </button>
      </div>

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Overall Percentage</div>
          <div className="text-3xl font-bold text-gray-900">{performanceSummary.overallPercentage}%</div>
          <div className={`text-xs font-medium mt-1 ${status.text}`}>{status.label}</div>
          <div className={`absolute top-0 right-0 w-1.5 h-full ${status.bg}`} />
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Class Rank</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gray-900">#{performanceSummary.classRank}</div>
            <div className="text-sm text-gray-500">/ {performanceSummary.totalStudents}</div>
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
            <Trophy size={12} /> Top 15% of class
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Exams Attempted</div>
          <div className="text-3xl font-bold text-gray-900">{performanceSummary.examsAttempted}</div>
          <div className="text-xs text-gray-500 font-medium mt-1">Current Academic Year</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Best Subject</div>
          <div className="text-xl font-bold text-gray-900 truncate">{performanceSummary.highestSubject}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <Award size={12} /> Keep it up!
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (Tables & Details) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Subject-wise Performance Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Subject-wise Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Subject</th>
                    <th className="px-5 py-3 font-semibold">Marks</th>
                    <th className="px-5 py-3 font-semibold">Progress</th>
                    <th className="px-5 py-3 font-semibold text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjectPerformance.map((subject, idx) => {
                    const percentage = (subject.marks / subject.total) * 100;
                    const rowStatus = getStatusColor(percentage);
                    
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-900">
                          {subject.subject}
                          {subject.subject === performanceSummary.highestSubject && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800">
                              Top
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          <span className="font-semibold text-gray-900">{subject.marks}</span> / {subject.total}
                        </td>
                        <td className="px-5 py-3.5 w-48">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${rowStatus.bg} rounded-full`} 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 w-8">{percentage.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                            percentage >= 90 ? 'bg-green-100 text-green-700' :
                            percentage >= 75 ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {subject.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* Right Column (Charts & Insights) */}
        <div className="space-y-6">
          
          {/* Exam Progress Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={18} />
              Exam Progress Trend
            </h2>
            
            <div className="h-[220px] flex items-end gap-3 justify-between mt-6 px-2">
              {examHistory.map((exam, i) => {
                const heightPercentage = Math.max(10, exam.percentage); // Minimum height
                
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="text-xs font-bold text-gray-700 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {exam.percentage}%
                    </div>
                    <div className="w-full max-w-[40px] bg-blue-100 rounded-t-md relative flex items-end justify-center group-hover:bg-blue-200 transition-colors" style={{ height: '150px' }}>
                      <div 
                        className="w-full bg-blue-600 rounded-t-md transition-all duration-500 ease-in-out group-hover:bg-blue-700"
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium text-center mt-3 h-8 leading-tight">
                      {exam.exam}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Performance Insights</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <div className="mt-0.5 text-emerald-600"><ChevronRight size={16} /></div>
                <p className="text-sm text-emerald-800">Your strongest subject is <strong>{performanceSummary.highestSubject}</strong> with {subjectPerformance.find(s => s.subject === performanceSummary.highestSubject)?.marks} marks.</p>
              </div>
              
              <div className="flex gap-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="mt-0.5 text-blue-600"><ChevronRight size={16} /></div>
                <p className="text-sm text-blue-800">Overall performance improved by <strong>9%</strong> since the last exam.</p>
              </div>
              
              <div className="flex gap-3 bg-orange-50 rounded-lg p-3 border border-orange-100">
                <div className="mt-0.5 text-orange-600"><ChevronRight size={16} /></div>
                <p className="text-sm text-orange-800"><strong>{performanceSummary.weakestSubject}</strong> performance needs attention. Consider revising the recent chapters.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
