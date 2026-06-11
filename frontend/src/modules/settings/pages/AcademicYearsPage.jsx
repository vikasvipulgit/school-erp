import React, { useState, useEffect } from 'react';
import { 
  getAcademicYears, 
  addAcademicYear, 
  activateAcademicYear, 
  updateAcademicYear 
} from '../services/academicYearsService';
import { useAcademicYear } from '@/core/context/AcademicYearContext';
import { Plus, CheckCircle2, Calendar, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/core/components/Button';
import { Card } from '@/core/components/Card';
import { Input } from '@/core/components/Input';
import { SectionHeader } from '@/core/components/SectionHeader';

export default function AcademicYearsPage() {
  const { activeYear, refreshActiveYear } = useAcademicYear();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const fetchYears = async () => {
    try {
      const data = await getAcademicYears();
      setYears(data);
    } catch (err) {
      console.error('Failed to fetch years', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !startDate || !endDate) {
      setError('All fields are required');
      return;
    }

    try {
      await addAcademicYear({ name, startDate, endDate });
      setName('');
      setStartDate('');
      setEndDate('');
      setIsAdding(false);
      fetchYears();
    } catch (err) {
      setError(err.message || 'Failed to create academic year');
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateAcademicYear(id);
      fetchYears();
      refreshActiveYear();
    } catch (err) {
      alert('Failed to activate year: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader 
          title="Academic Years" 
          description="Manage school sessions and active academic year"
        />
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          icon={isAdding ? X : Plus}
          variant={isAdding ? 'secondary' : 'primary'}
        >
          {isAdding ? 'Cancel' : 'Add Year'}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">New Academic Year</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
                <Input 
                  placeholder="e.g. 2025-2026" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <Button type="submit">Create Academic Year</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          years.map((year) => (
            <Card key={year.id} className={`p-5 border-t-4 ${year.isActive ? 'border-blue-600' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{year.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar size={14} />
                    <span>{new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {year.isActive && (
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6">
                {!year.isActive ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleActivate(year.id)}
                    icon={CheckCircle2}
                  >
                    Activate
                  </Button>
                ) : (
                  <div className="w-full py-2 px-4 bg-gray-50 text-gray-400 text-sm font-medium rounded-lg text-center flex items-center justify-center gap-2">
                    <Check size={16} />
                    Current Active Year
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
