import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DigitalCardRoutes from './DigitalCard/DigitalCardRoutes';
import AdminShortcutListener from './Admin_Panel/AdminShortcutListener';

const AdminRoutes = lazy(() => import('./Admin_Panel/AdminRoutes'));

function App() {
  return (
    <Router>
      <AdminShortcutListener />
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-950">
        <Routes>
          <Route path="/card/*" element={<DigitalCardRoutes />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={null}>
                <AdminRoutes />
              </Suspense>
            }
          />
          <Route path="/" element={<Navigate to="/card/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
