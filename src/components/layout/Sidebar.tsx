import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Link2, Upload, Search,
  Users, ClipboardList, Layers, LogOut,
  Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { initials } from '../../utils/helpers';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: () => void;
  onMobileClose: () => void;
}

const mainNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/add-url', icon: Link2, label: 'Add URL' },
  { to: '/upload', icon: Upload, label: 'Upload Files' },
  { to: '/search', icon: Search, label: 'Search' },
];

const adminNav = [
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/logs', icon: ClipboardList, label: 'Scrape Logs' },
];

export function Sidebar({ collapsed, mobileOpen, onCollapse, onMobileClose }: SidebarProps) {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside
      className={[
        'bg-brand flex flex-col flex-shrink-0 h-screen overflow-y-auto overflow-x-hidden',
        'transition-all duration-300 ease-in-out z-30',
        // Desktop: switch between full width and icon-rail width
        collapsed ? 'md:w-16' : 'md:w-[220px]',
        // Mobile: fixed overlay, always full width, slides in/out
        'fixed md:relative w-[220px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
    >
      {/* ── Header: logo + collapse button ────────────────────────── */}
      {/*
        Single element — no conditional rendering.
        When expanded: icon + text on the left, toggle button on the right.
        When collapsed: only the icon centered, toggle button below it.
        This avoids the ghost-space / layout-fight that happened with two
        competing divs both sitting in the same flex row.
      */}
      <div className="flex-shrink-0 border-b border-white/10">

        {/* Expanded header */}
        <div className={[
          'flex items-center h-14 px-4 gap-3 transition-all duration-300',
          collapsed ? 'md:hidden' : 'flex',
        ].join(' ')}>
          {/* Logo mark + wordmark */}
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Layers size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-[13px] leading-tight truncate">
              KnowledgeBase
            </div>
            <div className="text-white/45 text-[10px] truncate">Document Portal</div>
          </div>

          {/* Desktop collapse button — visible only in expanded state */}
          <button
            onClick={onCollapse}
            title="Collapse sidebar"
            className="hidden md:flex items-center justify-center w-6 h-6 flex-shrink-0
                       rounded-full bg-white/15 hover:bg-white/30 transition-colors text-white"
          >
            <ChevronLeft size={12} />
          </button>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            title="Close menu"
            className="md:hidden flex items-center justify-center w-6 h-6 flex-shrink-0
                       rounded-full bg-white/15 hover:bg-white/30 transition-colors text-white"
          >
            <ChevronLeft size={12} />
          </button>
        </div>

        {/* Collapsed header — icon-only, centered, with expand button below */}
        <div className={[
          'flex-col items-center py-3 gap-2',
          collapsed ? 'md:flex hidden' : 'hidden',
        ].join(' ')}>
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Layers size={16} className="text-white" />
          </div>
          <button
            onClick={onCollapse}
            title="Expand sidebar"
            className="flex items-center justify-center w-6 h-6
                       rounded-full bg-white/15 hover:bg-white/30 transition-colors text-white"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {!collapsed && <SectionLabel>Main</SectionLabel>}

        {mainNav.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            collapsed={collapsed}
            onClick={onMobileClose}
          />
        ))}

        {isAdmin() && (
          <>
            {!collapsed && <SectionLabel className="mt-3">Admin</SectionLabel>}
            {collapsed && <div className="my-2 border-t border-white/10 mx-1" />}
            {adminNav.map((item) => (
              <SidebarLink
                key={item.to}
                {...item}
                collapsed={collapsed}
                onClick={onMobileClose}
              />
            ))}
          </>
        )}
      </nav>

      {/* ── Footer: settings + user ───────────────────────────────── */}
      <div className="border-t border-white/10 px-2 py-2 space-y-1 flex-shrink-0">
        <SidebarLink
          to="/settings"
          icon={Settings}
          label="Settings"
          collapsed={collapsed}
          onClick={onMobileClose}
        />

        {/* User row */}
        {/* <div
          className={[
            'flex items-center rounded-lg hover:bg-white/10 transition-colors group',
            collapsed ? 'justify-center py-2 px-0' : 'gap-2.5 px-3 py-2',
          ].join(' ')}
        >
          <div
            title={collapsed ? (user?.username ?? '') : undefined}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center
                       text-white text-[11px] font-semibold flex-shrink-0"
          >
            {user ? initials(user.username) : '?'}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-[12.5px] font-medium truncate leading-tight">
                {user?.username}
              </div>
              <span className="text-[10px] bg-white/20 text-white/80 px-1.5 py-0.5 rounded-full leading-none">
                {user?.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Sign out"
            className={[
              'text-white/40 hover:text-white transition-colors p-1',
              collapsed ? '' : 'opacity-0 group-hover:opacity-100',
            ].join(' ')}
          >
            <LogOut size={13} />
          </button>
        </div> */}
      </div>
    </aside>
  );
}

/* ── Helpers ──────────────────────────────────────────────────── */

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35 ${className}`}>
      {children}
    </div>
  );
}

function SidebarLink({
  to, icon: Icon, label, collapsed, onClick,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          'flex items-center rounded-lg text-[13px] font-medium transition-colors my-0.5',
          collapsed ? 'justify-center py-2 px-0' : 'gap-2.5 px-3 py-2',
          isActive
            ? 'bg-white/18 text-white'
            : 'text-white/65 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      <Icon size={15} className="flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}