import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { auth } from './firebase/config';
import { ThemeProvider } from './context/ThemeContext'; // 👈 Import
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // User ko Layout tak pahunchane ke liye
  const routerWithUser = {
    ...router,
    routes: router.routes.map(route => ({
      ...route,
      element: React.cloneElement(route.element, { user }),
    }))
  };

  return (
    <ThemeProvider> {/* 👈 Wrap */}
      <RouterProvider router={routerWithUser} />
    </ThemeProvider>
  );
}

export default App;