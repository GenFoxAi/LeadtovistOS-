import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DemoGuide } from './DemoGuide';

export function Layout() {
  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <Outlet />
        <DemoGuide />
      </main>
    </div>
  );
}
