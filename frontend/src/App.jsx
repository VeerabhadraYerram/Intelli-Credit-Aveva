import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Optimization from './pages/Optimization';
import Explainability from './pages/Explainability';
import Execution from './pages/Execution';
import History from './pages/History';
import GapAnalysis from './pages/GapAnalysis';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="optimization" element={<Optimization />} />
          <Route path="explainability" element={<Explainability />} />
          <Route path="execution" element={<Execution />} />
          <Route path="history" element={<History />} />
          <Route path="gap-analysis" element={<GapAnalysis />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
