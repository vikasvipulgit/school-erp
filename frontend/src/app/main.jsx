import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@/core/context/AuthContext';
import { ClassesProvider } from '@/core/context/ClassesContext';
import AppRouter from './router';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ClassesProvider>
        <AppRouter />
      </ClassesProvider>
    </AuthProvider>
  </React.StrictMode>
);
