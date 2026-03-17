import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { 
        path: 'dashboard', 
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'history', 
        element: (
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'settings', 
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ) 
      },
    ]
  }
]);

export default router;