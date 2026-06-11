import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@/core/context/AuthContext';
import { ClassesProvider } from '@/core/context/ClassesContext';
import { AcademicYearProvider } from '@/core/context/AcademicYearContext';
import { ErrorBoundary } from '@/core/components/ErrorBoundary';
import AppRouter from './router';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster richColors position="top-right" />
      <AuthProvider>
        <AcademicYearProvider>
          <ClassesProvider>
            <AppRouter />
          </ClassesProvider>
        </AcademicYearProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
