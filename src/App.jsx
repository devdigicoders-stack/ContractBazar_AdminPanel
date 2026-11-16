import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Spinner, Center } from '@chakra-ui/react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Vendors from './pages/Vendors';
import Orders from './pages/Orders';
import DeliveryAgents from './pages/DeliveryAgents';
import DeliveryAgentDetail from './pages/DeliveryAgentDetail';
import VendorDetail from './pages/VendorDetail';
import Commissions from './pages/Commissions';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Protected Route Guard
function ProtectedLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh" bg="#0F172A">
        <Spinner size="xl" color="#E65100" thickness="4px" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <ChakraProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#0F172A',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600'
          }
        }}
      />
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
              <Route path="/categories" element={<ProtectedLayout><Categories /></ProtectedLayout>} />
              <Route path="/vendors" element={<ProtectedLayout><Vendors /></ProtectedLayout>} />
              <Route path="/vendors/:id" element={<ProtectedLayout><VendorDetail /></ProtectedLayout>} />
              <Route path="/orders" element={<ProtectedLayout><Orders /></ProtectedLayout>} />
              <Route path="/delivery-agents" element={<ProtectedLayout><DeliveryAgents /></ProtectedLayout>} />
              <Route path="/delivery-agents/:id" element={<ProtectedLayout><DeliveryAgentDetail /></ProtectedLayout>} />
              <Route path="/commissions" element={<ProtectedLayout><Commissions /></ProtectedLayout>} />
              <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

              {/* Catch-all redirect to / */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}
