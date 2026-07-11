import { useState } from 'react';
import { Shield, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/helpers';

export function SettingsPage() {
  const { user, setAuth } = useAuthStore();

  // ── Profile tab ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    username: user?.username ?? '',
    email:    user?.email    ?? '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await authApi.updateProfile({
        username: profileForm.username,
        email:    profileForm.email,
      });
      // Refresh stored user so navbar updates
      const token = localStorage.getItem('kb_token') ?? '';
      setAuth(data, token);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Password tab ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password:     '',
    confirm_password: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [pwLoading,   setPwLoading]   = useState(false);
  const [pwSuccess,   setPwSuccess]   = useState(false);

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    setPwSuccess(false);
    try {
      await authApi.changePassword(pwForm.current_password, pwForm.new_password);
      toast.success('Password updated successfully');
      setPwSuccess(true);
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPwLoading(false);
    }
  }

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  return (
    <div className="max-w-xl space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-gray-200">
        {([
          { key: 'profile',  label: 'Profile',         icon: User   },
          { key: 'password', label: 'Change Password',  icon: Shield },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === key
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {activeTab === 'profile' && (
        <div className="card">
          <div className="card-header">
            <User size={15} className="text-gray-400" />
            <span className="card-title">Profile Information</span>
          </div>
          <form onSubmit={handleProfileSave} className="p-5 space-y-4">
            {/* Avatar preview */}
            <div className="flex items-center gap-4 pb-2">
              <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center text-brand text-xl font-bold">
                {user?.username?.slice(0, 2).toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                <span className={`mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  user?.role === 'admin'
                    ? 'bg-brand-light text-brand'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text" className="input"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((f) => ({ ...f, username: e.target.value }))}
                  required minLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email" className="input"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary btn" disabled={profileLoading}>
                {profileLoading ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button" className="btn-secondary btn"
                onClick={() => setProfileForm({ username: user?.username ?? '', email: user?.email ?? '' })}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Password tab ── */}
      {activeTab === 'password' && (
        <div className="card">
          <div className="card-header">
            <Shield size={15} className="text-gray-400" />
            <span className="card-title">Change Password</span>
          </div>
          <form onSubmit={handlePasswordSave} className="p-5 space-y-4">
            {pwSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                <CheckCircle size={15} /> Password updated successfully.
              </div>
            )}

            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="input pr-9"
                  placeholder="Enter current password"
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  className="input pr-9"
                  placeholder="Min. 6 characters"
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
                  required minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength indicator */}
              {pwForm.new_password && (
                <div className="mt-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((lvl) => {
                      const strength =
                        (pwForm.new_password.length >= 6 ? 1 : 0) +
                        (/[A-Z]/.test(pwForm.new_password) ? 1 : 0) +
                        (/[0-9]/.test(pwForm.new_password) ? 1 : 0) +
                        (/[^A-Za-z0-9]/.test(pwForm.new_password) ? 1 : 0);
                      return (
                        <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors ${
                          lvl <= strength
                            ? strength <= 1 ? 'bg-red-400'
                            : strength === 2 ? 'bg-yellow-400'
                            : 'bg-green-500'
                            : 'bg-gray-200'
                        }`} />
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {(() => {
                      const s =
                        (pwForm.new_password.length >= 6 ? 1 : 0) +
                        (/[A-Z]/.test(pwForm.new_password) ? 1 : 0) +
                        (/[0-9]/.test(pwForm.new_password) ? 1 : 0) +
                        (/[^A-Za-z0-9]/.test(pwForm.new_password) ? 1 : 0);
                      return s <= 1 ? 'Weak' : s === 2 ? 'Fair' : s === 3 ? 'Good' : 'Strong';
                    })()}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
              <input
                type="password" className="input"
                placeholder="Repeat new password"
                value={pwForm.confirm_password}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm_password: e.target.value }))}
                required
              />
              {pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="pt-1">
              <button
                type="submit" className="btn-primary btn"
                disabled={
                  pwLoading ||
                  !pwForm.current_password ||
                  !pwForm.new_password ||
                  pwForm.new_password !== pwForm.confirm_password
                }
              >
                {pwLoading ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
