import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { initials } from '../../utils/helpers';

interface NavbarProps { title: string }

export function Navbar({ title }: NavbarProps) {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="text-[15px] font-semibold text-gray-900 whitespace-nowrap">{title}</h1>

      {/* Global search */}
      <div className="relative flex-1 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search documents… (Enter)"
          className="input pl-8 h-8 text-[13px] bg-gray-50"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button className="btn-ghost btn p-2"><Bell size={16} /></button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 ml-1 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center text-brand text-[11px] font-semibold">
              {user ? initials(user.username) : '?'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-gray-900 leading-tight">{user?.username}</div>
              <div className="text-[10px] text-gray-500">{isAdmin() ? 'Admin' : 'User'}</div>
            </div>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-gray-200 shadow-lg z-30 py-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-900">{user?.username}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
