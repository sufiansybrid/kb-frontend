import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Link2, Upload, Search, Users, ClipboardList, Layers, LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { initials } from '../../utils/helpers';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/add-url', icon: Link2, label: 'Add URL' },
  { to: '/upload', icon: Upload, label: 'Upload Files' },
  { to: '/search', icon: Search, label: 'Search' },
];

const adminItems = [
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/logs', icon: ClipboardList, label: 'Scrape Logs' },
];

export function Sidebar() {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="w-[220px] bg-brand flex flex-col flex-shrink-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Layers size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">KnowledgeBase</div>
            <div className="text-white/50 text-[11px]">Document Portal</div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-3">
        <SectionLabel>Main</SectionLabel>
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}

        {isAdmin() && (
          <>
            <SectionLabel className="mt-2">Admin</SectionLabel>
            {adminItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {user ? initials(user.username) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">{user?.username}</div>
            <span className="inline-block mt-0.5 text-[10px] bg-white/20 text-white/90 px-1.5 py-0.5 rounded-full leading-none">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-white/50 hover:text-white transition-colors p-1"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/40 ${className}`}>
      {children}
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors my-0.5 ` +
        (isActive ? 'bg-white/18 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white')
      }
    >
      <Icon size={15} className="flex-shrink-0 opacity-90" />
      {label}
    </NavLink>
  );
}
