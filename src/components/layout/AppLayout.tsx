import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/add-url': 'Add URL',
  '/upload': 'Upload Files',
  '/search': 'Search',
  '/settings': 'Settings',
  '/admin/users': 'User Management',
  '/admin/logs': 'Scrape Logs',
};

export function AppLayout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Knowledge Base';

  // Desktop: sidebar can be fully collapsed to icon-rail (collapsed=true)
  // Mobile:  sidebar slides in as an overlay (mobileOpen=true)
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Auto-close mobile drawer on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setMobileOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={() => setCollapsed((v) => !v)}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          title={title}
          onMenuClick={() => setMobileOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
