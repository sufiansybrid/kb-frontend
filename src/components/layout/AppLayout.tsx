import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/add-url': 'Add URL',
  '/upload': 'Upload Files',
  '/search': 'Search',
  '/admin/users': 'User Management',
  '/admin/logs': 'Scrape Logs',
};

export function AppLayout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Knowledge Base';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
