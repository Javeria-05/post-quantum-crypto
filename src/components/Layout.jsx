import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ user }) {
  return (
    <>
      <Navbar user={user} />
      <Outlet />
    </>
  );
}