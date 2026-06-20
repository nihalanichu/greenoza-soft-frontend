import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ShopProvider } from './hooks/useShop';
import './App.css';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Payables from './pages/Payables';
import Receivables from './pages/Receivables';
import Reports from './pages/Reports';
import Shops from './pages/Shops';
import DailyClosing from './pages/DailyClosing';
import Invoice from './pages/Invoice';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShopProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="purchases" element={<Purchases />} />
                        <Route path="sales" element={<Sales />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="payables" element={<Payables />} />
                        <Route path="receivables" element={<Receivables />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="invoice/:id" element={<Invoice />} />
                        <Route path="daily-closing" element={<DailyClosing />} />
                        <Route path="shops" element={<Shops />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ShopProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
