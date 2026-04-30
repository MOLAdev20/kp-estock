import { isAxiosError } from "axios";
import { ChevronRight, KeyRound, Plus, SquarePen, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import type { ManagedUser } from "../types";
import userManagementServices from "../services/userManagementServices";

type UserFormState = {
  username: string;
  email: string;
  role: string;
};

const initialUserForm: UserFormState = {
  username: "",
  email: "",
  role: "staff",
};

const UserManagementPage = () => {
  const [data, setData] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [addForm, setAddForm] = useState<UserFormState>(initialUserForm);
  const [addPassword, setAddPassword] = useState("");

  const [editForm, setEditForm] = useState<UserFormState>(initialUserForm);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  const [passwordValue, setPasswordValue] = useState("");

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      return error.response?.data?.message || fallback;
    }

    return fallback;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await userManagementServices.getUsers();
      setData(users);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      toast.error(getErrorMessage(error, "Gagal memuat data user"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manajemen User | EStock";
    fetchUsers();
  }, []);

  const openEditModal = (user: ManagedUser) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: "staff",
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: ManagedUser) => {
    setSelectedUser(user);
    setPasswordValue("");
    setShowPasswordModal(true);
  };

  const closeAllModals = () => {
    if (submitting) {
      return;
    }

    setShowAddModal(false);
    setShowEditModal(false);
    setShowPasswordModal(false);
    setSelectedUser(null);
    setAddForm(initialUserForm);
    setAddPassword("");
    setEditForm(initialUserForm);
    setPasswordValue("");
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!addForm.username.trim() || !addForm.email.trim() || !addPassword.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      const created = await userManagementServices.createUser({
        username: addForm.username.trim(),
        email: addForm.email.trim(),
        role: addForm.role,
        password: addPassword,
      });
      setData((prev) => [created, ...prev]);
      toast.success("User berhasil ditambahkan");
      closeAllModals();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menambahkan user"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    if (!editForm.username.trim() || !editForm.email.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }

    const confirmed = window.confirm("Yakin ingin memperbarui data user ini?");

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      const updated = await userManagementServices.updateUser(selectedUser.id, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      });
      setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("User berhasil diperbarui");
      closeAllModals();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memperbarui user"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    if (!passwordValue.trim()) {
      toast.error("Password baru wajib diisi");
      return;
    }

    const confirmed = window.confirm("Yakin ingin mengganti password user ini?");

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      await userManagementServices.changePassword(selectedUser.id, passwordValue);
      toast.success("Password user berhasil diganti");
      closeAllModals();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal mengganti password"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Manajemen User</h1>
          <small>Kelola akun staff langsung dari dashboard admin</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <Users size={16} />
          <ChevronRight size={16} />
          <span>Manajemen User</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-600 active:scale-95"
        >
          <Plus size={16} />
          Tambah User
        </button>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Role
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      Memuat data user...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      Belum ada data user staff.
                    </td>
                  </tr>
                ) : (
                  data.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">
                        {user.username}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{user.role}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <SquarePen size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openPasswordModal(user)}
                          className="ml-2 inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-amber-700 transition-colors hover:bg-amber-50"
                        >
                          <KeyRound size={14} />
                          Ganti Password
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-slate-800">Tambah User Staff</h2>
            <form className="mt-4 space-y-3" onSubmit={handleCreateUser}>
              <input
                type="text"
                value={addForm.username}
                onChange={(event) =>
                  setAddForm((prev) => ({ ...prev, username: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                placeholder="Username"
              />
              <input
                type="email"
                value={addForm.email}
                onChange={(event) =>
                  setAddForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                placeholder="Email"
              />
              <input
                type="password"
                value={addPassword}
                onChange={(event) => setAddPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                placeholder="Password"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAllModals}
                  disabled={submitting}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showEditModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-slate-800">Edit User Staff</h2>
            <form className="mt-4 space-y-3" onSubmit={handleEditUser}>
              <input
                type="text"
                value={editForm.username}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, username: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                placeholder="Username"
              />
              <input
                type="email"
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                placeholder="Email"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAllModals}
                  disabled={submitting}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showPasswordModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-slate-800">Ganti Password</h2>
            <p className="mt-1 text-sm text-slate-600">
              User: {selectedUser?.username || "-"}
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleChangePassword}>
              <input
                type="password"
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                placeholder="Password baru"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAllModals}
                  disabled={submitting}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {submitting ? "Menyimpan..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default UserManagementPage;
