"use client";

import React, { useEffect, useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider, useAuth } from '@/context/authContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import { isTokenValid } from '@/lib/jwt';

// Guards every route except `/`. Runs on first mount of each page (including
// a hard refresh, since layout.js remounts) and again whenever the pathname
// changes.
//
// Session state lives entirely in the `Authorization` value login stores in
// localStorage (see app/page.tsx / constants.js) — there is no separate
// validation endpoint to call, so validity is just "well-formed JWT, not
// expired yet" (see lib/jwt.js). The previous version of this check looked
// for `access-token`/`client`/`uid` keys and called `/auth/validate_token`;
// the app never wrote those keys and the backend never routed that endpoint,
// so every direct navigation or refresh to a non-home page was bounced
// straight back to login regardless of whether the session was actually
// still good.
const ValidateAuth = () => {
  const { setAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') return;

    const token = localStorage.getItem('Authorization');

    if (isTokenValid(token)) {
      setAuth({ token });
      return;
    }

    localStorage.removeItem('Authorization');
    setAuth(null);
    router.push('/');
  }, [pathname, router, setAuth]);

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
