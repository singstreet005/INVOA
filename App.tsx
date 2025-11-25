import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Movements from './pages/Movements';
import Finance from './pages/Finance';
import LowStock from './pages/LowStock';
import Reports from './pages/Reports';
import { InventoryProvider } from './context/InventoryContext';

const App: React.FC = () => {
  return (
    <InventoryProvider>
      <HashRouter>
        <Routes>
          {/* Standalone Route for Report (No Layout) */}
          <Route path="/low-stock" element={<LowStock />} />
          
          {/* Main App Routes with Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/movements" element={<Movements />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </HashRouter>
    </InventoryProvider>
  );
};

export default App;