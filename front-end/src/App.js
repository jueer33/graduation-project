import React from 'react';
import { AppProvider } from './store/store';
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

export default App;

