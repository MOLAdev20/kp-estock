import { isAxiosError } from "axios";
import { Building2, ChevronRight, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import toast, { Toaster } from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import supplierServices from "../services/supplierServices";
import type { Supplier, SupplierPayload } from "../types";

type SupplierFormState = {
  suppliers_code: string;
  name: string;
  pic: string;
  phone: string;
  email: string;
  address: string;
  moq: string;
  bankName: string;
  bankAccount: string;
};

const initialSupplierForm: SupplierFormState = {
  suppliers_code: "",
  name: "",
  pic: "",
  phone: "",
  email: "",
  address: "",
  moq: "0",
  bankName: "",
  bankAccount: "",
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const mapSupplierToForm = (supplier: Supplier): SupplierFormState => ({
  suppliers_code: supplier.suppliers_code,
  name: supplier.name,
  pic: supplier.pic || "",
  phone: supplier.phone,
  email: supplier.email || "",
  address: supplier.address,
  moq: String(supplier.moq),
  bankName: supplier.bankName || "",
  bankAccount: supplier.bankAccount || "",
});

const buildPayload = (form: SupplierFormState): SupplierPayload => ({
  suppliers_code: form.suppliers_code.trim(),
  name: form.name.trim(),
  pic: form.pic.trim(),
  phone: form.phone.trim(),
  email: form.email.trim(),
  address: form.address.trim(),
  moq: Number(form.moq || 0),
  bankName: form.bankName.trim(),
  bankAccount: form.bankAccount.trim(),
});

const SupplierManagementPage = () => {
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [addForm, setAddForm] = useState<SupplierFormState>(initialSupplierForm);
  const [editForm, setEditForm] = useState<SupplierFormState>(initialSupplierForm);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      return error.response?.data?.message || fallback;
    }

    return fallback;
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const suppliers = await supplierServices.getSuppliers();
      setData(suppliers);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      toast.error(getErrorMessage(error, "Gagal memuat data supplier"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manajemen Supplier | EStock";
    fetchSuppliers();
  }, []);

  const closeAllModals = (force = false) => {
    if (submitting && !force) {
      return;
    }

    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedSupplier(null);
    setAddForm(initialSupplierForm);
    setEditForm(initialSupplierForm);
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditForm(mapSupplierToForm(supplier));
    setShowEditModal(true);
  };

  const openDetailModal = async (supplierId: number) => {
    try {
      setLoading(true);
      const supplier = await supplierServices.getSupplierById(supplierId);
      setSelectedSupplier(supplier);
      setShowDetailModal(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat detail supplier"));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (payload: SupplierPayload) => {
    if (!payload.suppliers_code || !payload.name || !payload.phone || !payload.address) {
      toast.error("Kode, nama, telepon, dan alamat wajib diisi");
      return false;
    }

    if (!Number.isInteger(payload.moq) || payload.moq < 0) {
      toast.error("MOQ harus berupa angka bulat minimal 0");
      return false;
    }

    return true;
  };

  const handleCreateSupplier = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = buildPayload(addForm);

    if (!validateForm(payload)) {
      return;
    }

    try {
      setSubmitting(true);
      const created = await supplierServices.createSupplier(payload);
      setData((prev) => [created, ...prev]);
      toast.success("Supplier berhasil ditambahkan");
      closeAllModals();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menambahkan supplier"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSupplier = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSupplier) {
      return;
    }

    const payload = buildPayload(editForm);

    if (!validateForm(payload)) {
      return;
    }

    const confirmed = window.confirm("Yakin ingin memperbarui data supplier ini?");

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      const updated = await supplierServices.updateSupplier(selectedSupplier.id, payload);
      setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedSupplier(updated);
      toast.success("Supplier berhasil diperbarui");
      closeAllModals();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memperbarui supplier"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus supplier ${supplier.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      await supplierServices.deleteSupplier(supplier.id);
      setData((prev) => prev.filter((item) => item.id !== supplier.id));
      if (selectedSupplier?.id === supplier.id) {
        closeAllModals(true);
      }
      toast.success("Supplier berhasil dihapus");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus supplier"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderSupplierForm = (
    form: SupplierFormState,
    setForm: Dispatch<SetStateAction<SupplierFormState>>,
  ) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <input
        type="text"
        value={form.suppliers_code}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, suppliers_code: event.target.value.toUpperCase() }))
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
        placeholder="Kode Supplier"
      />
      <input
        type="text"
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
        placeholder="Nama Supplier"
      />
      <input
        type="text"
        value={form.pic}
        onChange={(event) => setForm((prev) => ({ ...prev, pic: event.target.value }))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
        placeholder="PIC"
      />
      <input
        type="text"
        value={form.phone}
        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
        placeholder="Nomor Telepon"
      />
      <input
        type="email"
        value={form.email}
        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
        placeholder="Email"
      />
      <input
        type="number"
        min="0"
        value={form.moq}
        onChange={(event) => setForm((prev) => ({ ...prev, moq: event.target.value }))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
        placeholder="MOQ"
      />
      <input
        type="text"
        value={form.bankName}
        onChange={(event) => setForm((prev) => ({ ...prev, bankName: event.target.value }))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
        placeholder="Nama Bank"
      />
      <input
        type="text"
        value={form.bankAccount}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, bankAccount: event.target.value }))
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
        placeholder="Nomor Rekening"
      />
      <textarea
        value={form.address}
        onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
        className="sm:col-span-2 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
        placeholder="Alamat Supplier"
      />
    </div>
  );

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Manajemen Supplier</h1>
          <small>Kelola data supplier dan lihat detailnya dari halaman ini</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <Building2 size={16} />
          <ChevronRight size={16} />
          <span>Manajemen Supplier</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-600 active:scale-95"
        >
          <Plus size={16} />
          Tambah Supplier
        </button>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-700">Daftar Supplier</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    PIC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Telepon
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    MOQ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                      Memuat data supplier...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                      Belum ada data supplier.
                    </td>
                  </tr>
                ) : (
                  data.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">
                        {supplier.suppliers_code}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-xs text-slate-500">
                          {supplier.email || "Tanpa email"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {supplier.pic || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {supplier.phone}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                        {supplier.moq}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => openDetailModal(supplier.id)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <Eye size={14} />
                          Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(supplier)}
                          className="ml-2 inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSupplier(supplier)}
                          className="ml-2 inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Hapus
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
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-slate-800">Tambah Supplier</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateSupplier}>
              {renderSupplierForm(addForm, setAddForm)}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => closeAllModals()}
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
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-slate-800">Edit Supplier</h2>
            <form className="mt-4 space-y-4" onSubmit={handleEditSupplier}>
              {renderSupplierForm(editForm, setEditForm)}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => closeAllModals()}
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

      {showDetailModal && selectedSupplier ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Detail Supplier
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedSupplier.suppliers_code}
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeAllModals()}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Nama Supplier</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {selectedSupplier.name}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">PIC</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {selectedSupplier.pic || "-"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Telepon</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {selectedSupplier.phone}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Email</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {selectedSupplier.email || "-"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">MOQ</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {selectedSupplier.moq}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Rekening Bank</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {selectedSupplier.bankName || selectedSupplier.bankAccount
                    ? `${selectedSupplier.bankName || "-"} / ${selectedSupplier.bankAccount || "-"}`
                    : "-"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs uppercase text-slate-500">Alamat</p>
                <p className="mt-1 text-sm font-medium whitespace-pre-wrap text-slate-800">
                  {selectedSupplier.address}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Dibuat</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {formatDateTime(selectedSupplier.createdAt)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Diperbarui</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {formatDateTime(selectedSupplier.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default SupplierManagementPage;
