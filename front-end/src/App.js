import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppStore } from './store/store';
import { ToastProvider } from './components/Toast/ToastContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import './App.css';

// 路由守卫组件
const ProtectedRoute = ({ children }) => {
  const { user, token } = useAppStore();
  
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 根组件
function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/:module?/:sessionId?" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/text-to-design" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;