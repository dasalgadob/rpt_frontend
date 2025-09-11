"use client";

import React, { useEffect, useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider, useAuth } from '@/context/authContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, usePathname } from 'next/navigation';
import PropTypes from 'prop-types';

const ValidateAuth = () => {
  const { auth, setAuth } = useAuth(); // Access auth context
  const router = useRouter();
  const pathname = usePathname();
  const [isValidated, setIsValidated] = useState(false); // Track validation status

  useEffect(() => {
    const validateToken = async (accessToken, client, uid) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/validate_token`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'access-token': accessToken,
              client: client,
              uid: uid
            }
          }
        );

        if (!response.ok) {
          throw new Error('Token validation failed');
        }

        setAuth({ accessToken, client, uid }); // Update auth context
        setIsValidated(true); // Mark validation as complete
      } catch (error) {
        console.error('🚀 ~ validateToken ~ error:', error);
        localStorage.removeItem('access-token');
        localStorage.removeItem('client');
        localStorage.removeItem('uid');
        
        // Only redirect if not already on home page
        if (pathname !== '/') {
          router.push('/');
        }
      }
    };

    const checkAuth = () => {
      if (isValidated) return; // Prevent re-validation

      // Skip auth validation for home page
      if (pathname === '/') {
        setIsValidated(true);
        return;
      }

      if (auth?.accessToken && auth?.client && auth?.uid) {
        // If auth context has values, validate them
        validateToken(auth.accessToken, auth.client, auth.uid);
      } else {
        // Otherwise, check localStorage for values
        const accessToken = localStorage.getItem('access-token');
        const client = localStorage.getItem('client');
        const uid = localStorage.getItem('uid');

        if (accessToken && client && uid) {
          validateToken(accessToken, client, uid); // Validate localStorage values
        } else {
          // Clear localStorage and redirect to home if no values are found
          localStorage.removeItem('access-token');
          localStorage.removeItem('client');
          localStorage.removeItem('uid');
          
          // Only redirect if not already on home page
          if (pathname !== '/') {
            router.push('/');
          }
        }
      }
    };

    checkAuth(); // Run the checkAuth function on page load
  }, [auth, router, pathname, isValidated, setAuth]);

  return null; // This component doesn't render anything
};

const RootLayout = ({ children }) => (
  <html lang="en" style={{ height: '100%', minHeight: '100vh' }}>
    <body style={{ margin: 0, padding: 0, minHeight: '100vh', height: '100%' }}>
      <AuthProvider>
        <ValidateAuth />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <AntdRegistry>{children}</AntdRegistry>
      </AuthProvider>
    </body>
  </html>
);

RootLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default RootLayout;