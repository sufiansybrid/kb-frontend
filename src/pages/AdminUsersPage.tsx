import { useEffect, useState, useCallback } from 'react';
import { Users, UserMinus, Shield, UserCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../api/services';
import type { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonRow } from '../components/ui/Skeleton';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, initials, getErrorMessage } from '../utils/helpers';

export function AdminUsersPage() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [pages, setPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQ, setSearchQ] = useState('');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listUsers({ page, per_page: perPage, role: roleFilter, q: searchQ });
      setUsers(data.users);
      setTotal(data.total);
      setPages(Math.ceil(data.total / perPage));
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, roleFilter, searchQ]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  async function toggleActive(user: User) {
    setToggleLoading(user.id);
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggleLoading(null);
    }
  }

  async function toggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setToggleLoading(user.id);
    try {
      await adminApi.updateUser(user.id, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggleLoading(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-header">
          <Users size={15} className="text-gray-400" />
          <span className="card-title">User Management</span>
          <div className="ml-auto text-xs text-gray-400">{total} users</div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or name…"
              className="input h-8 text-xs pl-7 w-50"
              value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); setPage(1); }}
            />
          </div>
          <select className="select h-8 text-xs" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">User</th>
                <th className="th">Role</th>
                <th className="th">Documents</th>
                <th className="th">Joined</th>
                <th className="th">Status</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                : users.length === 0
                ? <tr><td colSpan={6}><EmptyState title="No users found" /></td></tr>
                : users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-light text-brand flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {initials(user.username)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-brand-light text-brand' : 'bg-gray-100 text-gray-600'}`}>
                        {user.role === 'admin' ? <Shield size={10} /> : <UserCheck size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="td text-sm text-gray-700">{user.document_count}</td>
                    <td className="td text-xs text-gray-500">{formatDate(user.created_at)}</td>
                    <td className="td">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="td">
                      <div className="flex gap-1">
                        {user.id !== me?.id && (
                          <>
                            <button
                              title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                              className="btn-ghost btn btn-sm px-1.5"
                              disabled={toggleLoading === user.id}
                              onClick={() => toggleRole(user)}
                            >
                              <Shield size={13} className={user.role === 'admin' ? 'text-brand' : 'text-gray-400'} />
                            </button>
                            <button
                              title={user.is_active ? 'Deactivate' : 'Activate'}
                              className="btn-ghost btn btn-sm px-1.5"
                              disabled={toggleLoading === user.id}
                              onClick={() => toggleActive(user)}
                            >
                              {user.is_active
                                ? <UserMinus size={13} className="text-yellow-600" />
                                : <UserCheck size={13} className="text-green-600" />
                              }
                            </button>
                            <button
                              title="Delete user"
                              className="btn-danger btn btn-sm px-1.5"
                              onClick={() => setDeleteId(user.id)}
                            >
                              <UserMinus size={13} />
                            </button>
                          </>
                        )}
                        {user.id === me?.id && <span className="text-xs text-gray-400 px-1">You</span>}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        <Pagination page={page} pages={pages} total={total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        message="This will permanently delete the user and all their documents."
      />
    </div>
  );
}
