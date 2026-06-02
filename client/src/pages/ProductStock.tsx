import { isAxiosError } from "axios";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  Check,
  ChevronDown,
  ChevronRight,
  History,
  Search,
  Warehouse,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import stockManagementServices from "../services/stockManagementServices";
import supplierServices from "../services/supplierServices";
import type {
  StockAdjustmentType,
  StockAuditTrail,
  StockAuditTrailFilters,
  StockManagementProduct,
  Supplier,
} from "../types";

type AdjustmentFormState = {
  action: string;
  adjustment: string;
  supplierId: string;
  notes: string;
};

const currentDate = new Date();

const initialFilters: StockAuditTrailFilters = {
  periodType: "monthly",
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear(),
  supplierId: "",
  adjustmentType: "all",
};

const actionOptions: Record<StockAdjustmentType, { value: string; label: string }[]> = {
  increase: [
    { value: "PO_RECEIPT", label: "PO Receipt" },
    { value: "STOCK_OPNAME", label: "Stock Opname" },
    { value: "MANUAL_ADJUSTMENT", label: "Manual Adjustment" },
  ],
  decrease: [
    { value: "MANUAL_ADJUSTMENT", label: "Manual Adjustment" },
    { value: "STOCK_OPNAME", label: "Stock Opname" },
    { value: "DAMAGED", label: "Damaged Product" },
    { value: "EXPIRED", label: "Expired Product" },
  ],
};

const monthOptions = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

const buildInitialForm = (type: StockAdjustmentType): AdjustmentFormState => ({
  action: actionOptions[type][0].value,
  adjustment: "",
  supplierId: "",
  notes: "",
});

const ProductStockPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<StockManagementProduct | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [trails, setTrails] = useState<StockAuditTrail[]>([]);
  const [filters, setFilters] = useState<StockAuditTrailFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState<StockAdjustmentType | null>(null);
  const [form, setForm] = useState<AdjustmentFormState>(buildInitialForm("increase"));
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement | null>(null);

  const filteredSuppliers = useMemo(() => {
    const keyword = supplierSearch.trim().toLowerCase();

    if (!keyword) {
      return suppliers;
    }

    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(keyword),
    );
  }, [supplierSearch, suppliers]);

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => String(supplier.id) === form.supplierId),
    [form.supplierId, suppliers],
  );

  useEffect(() => {
    if (!uuid) {
      navigate("/stock-management");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [stockProduct, supplierData] = await Promise.all([
          stockManagementServices.getStockProduct(uuid),
          supplierServices.getSuppliers(),
        ]);
        setProduct(stockProduct);
        setSuppliers(supplierData);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return;
        }

        toast.error(getErrorMessage(error, "Gagal memuat data stok produk"));
        navigate("/stock-management");
      } finally {
        setLoading(false);
      }
    };

    document.title = "Product Stock | EStock";
    fetchInitialData();
  }, [navigate, uuid]);

  useEffect(() => {
    if (!uuid) {
      return;
    }

    const fetchAuditTrails = async () => {
      try {
        setHistoryLoading(true);
        const data = await stockManagementServices.getAuditTrails(uuid, filters);
        setTrails(data);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return;
        }

        toast.error(getErrorMessage(error, "Gagal memuat riwayat perubahan stok"));
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchAuditTrails();
  }, [filters, uuid]);

  useEffect(() => {
    if (!supplierDropdownOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setSupplierDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [supplierDropdownOpen]);

  const openAdjustmentModal = (type: StockAdjustmentType) => {
    setModalType(type);
    setForm(buildInitialForm(type));
    setSupplierSearch("");
    setSupplierDropdownOpen(false);
  };

  const closeAdjustmentModal = () => {
    if (submitting) {
      return;
    }

    setModalType(null);
    setForm(buildInitialForm("increase"));
    setSupplierSearch("");
    setSupplierDropdownOpen(false);
  };

  const submitAdjustment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uuid || !modalType) {
      return;
    }

    const adjustment = Number(form.adjustment);

    if (!Number.isInteger(adjustment) || adjustment <= 0) {
      toast.error("Adjustment harus berupa bilangan bulat lebih dari 0");
      return;
    }

    if (modalType === "increase" && !form.supplierId) {
      toast.error("Supplier wajib dipilih saat stok bertambah");
      return;
    }

    if (!form.action.trim()) {
      toast.error("Action wajib dipilih");
      return;
    }

    try {
      setSubmitting(true);
      const result = await stockManagementServices.adjustProductStock(uuid, {
        adjustmentType: modalType,
        action: form.action,
        adjustment,
        supplierId: modalType === "increase" ? Number(form.supplierId) : null,
        notes: form.notes.trim(),
      });

      setProduct(result.product);
      setTrails((prev) => [result.trail, ...prev]);
      toast.success("Perubahan stok berhasil disimpan");
      setModalType(null);
      setForm(buildInitialForm("increase"));
      setSupplierSearch("");
      setSupplierDropdownOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan perubahan stok"));
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = modalType === "increase" ? "Tambah Stok" : "Kurangi Stok";

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <Link
            to="/stock-management"
            className="mb-3 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-red-600"
          >
            <ArrowLeft size={16} />
            Kembali ke Stock Management
          </Link>
          <h1 className="text-3xl sm:text-4xl">
            Product Stock {product ? `"${product.productTitle}"` : ""}
          </h1>
          <small>Workspace untuk audit, tambah, dan kurangi stok produk</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <Warehouse size={16} />
          <ChevronRight size={16} />
          <span>Product Stock</span>
        </div>
      </div>

      {loading || !product ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Memuat data stok produk...
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Produk</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-800">
                {product.productTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {product.productSku} • {product.category} • {product.unit}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Stok Saat Ini
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-800">
                {product.stock}
              </h2>
              <p className="text-xs text-slate-500">Min. stok {product.minimumStock}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Harga Jual
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-800">
                {formatCurrency(product.sellingPrice)}
              </h2>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openAdjustmentModal("increase")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-95"
            >
              <ArrowUpCircle size={16} />
              Tambah Stok
            </button>
            <button
              type="button"
              onClick={() => openAdjustmentModal("decrease")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-600 active:scale-95"
            >
              <ArrowDownCircle size={16} />
              Kurangi Stok
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <History size={17} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-700">
                  Riwayat Perubahan Stok
                </h2>
              </div>
            </div>

            <div className="border-b border-slate-100 p-4">
              <div className="grid gap-3 md:grid-cols-5">
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block text-xs font-medium uppercase text-slate-500">
                    Periode
                  </span>
                  <select
                    value={filters.periodType}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        periodType: event.target.value as "monthly" | "yearly",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                  >
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </label>
                {filters.periodType === "monthly" ? (
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block text-xs font-medium uppercase text-slate-500">
                      Bulan
                    </span>
                    <select
                      value={filters.month}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          month: Number(event.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                    >
                      {monthOptions.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block text-xs font-medium uppercase text-slate-500">
                    Tahun
                  </span>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        year: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block text-xs font-medium uppercase text-slate-500">
                    Supplier
                  </span>
                  <select
                    value={filters.supplierId}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        supplierId:
                          event.target.value === "" ? "" : Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Semua Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block text-xs font-medium uppercase text-slate-500">
                    Tipe
                  </span>
                  <select
                    value={filters.adjustmentType}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        adjustmentType: event.target.value as
                          | "all"
                          | StockAdjustmentType,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                  >
                    <option value="all">Semua</option>
                    <option value="increase">Stok Bertambah</option>
                    <option value="decrease">Stok Berkurang</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Action
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                      Awal
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                      Adjustment
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                      Akhir
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Memuat riwayat perubahan stok...
                      </td>
                    </tr>
                  ) : trails.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Belum ada riwayat perubahan stok pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    trails.map((trail) => (
                      <tr key={trail.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                          {formatDateTime(trail.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {trail.action.replaceAll("_", " ")}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">
                          {trail.initialStock}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          <span
                            className={
                              trail.adjustment > 0
                                ? "text-emerald-700"
                                : "text-red-600"
                            }
                          >
                            {trail.adjustment > 0 ? "+" : ""}
                            {trail.adjustment}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">
                          {trail.finalStock}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {trail.supplier?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {trail.user?.username || "-"}
                        </td>
                        <td className="min-w-56 px-4 py-3 text-sm text-slate-700">
                          {trail.notes || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {modalType ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div
                className={
                  modalType === "increase"
                    ? "rounded-md bg-emerald-100 p-2 text-emerald-700"
                    : "rounded-md bg-red-100 p-2 text-red-600"
                }
              >
                {modalType === "increase" ? (
                  <ArrowUpCircle size={18} />
                ) : (
                  <ArrowDownCircle size={18} />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  {modalTitle}
                </h3>
                <p className="text-sm text-slate-600">{product?.productTitle}</p>
              </div>
            </div>

            <form className="mt-4 space-y-3" onSubmit={submitAdjustment}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-slate-700">
                  <span className="mb-1.5 block font-medium">Action</span>
                  <select
                    value={form.action}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, action: event.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                  >
                    {actionOptions[modalType].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-700">
                  <span className="mb-1.5 block font-medium">Adjustment</span>
                  <input
                    type="number"
                    min={1}
                    value={form.adjustment}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, adjustment: event.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                    placeholder="Jumlah perubahan stok"
                    required
                  />
                </label>
              </div>

              {modalType === "increase" ? (
                <div ref={supplierDropdownRef} className="relative">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Supplier
                  </span>
                  <button
                    type="button"
                    onClick={() => setSupplierDropdownOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                  >
                    <span
                      className={
                        selectedSupplier ? "text-slate-800" : "text-slate-400"
                      }
                    >
                      {selectedSupplier
                        ? `${selectedSupplier.name} (${selectedSupplier.suppliers_code})`
                        : "Pilih supplier"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-slate-400 transition-transform ${
                        supplierDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {supplierDropdownOpen ? (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                      <div className="border-b border-slate-100 p-3">
                        <div className="relative">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            value={supplierSearch}
                            onChange={(event) => setSupplierSearch(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                            placeholder="Cari nama toko/perusahaan supplier"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-56 overflow-y-auto py-1">
                        {filteredSuppliers.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-slate-500">
                            Supplier tidak ditemukan.
                          </div>
                        ) : (
                          filteredSuppliers.map((supplier) => {
                            const isSelected = form.supplierId === String(supplier.id);

                            return (
                              <button
                                key={supplier.id}
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    supplierId: String(supplier.id),
                                  }));
                                  setSupplierSearch("");
                                  setSupplierDropdownOpen(false);
                                }}
                                className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "bg-red-50 text-red-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span>
                                  <span className="block font-medium">
                                    {supplier.name}
                                  </span>
                                  <span className="block text-xs text-slate-500">
                                    {supplier.suppliers_code}
                                  </span>
                                </span>
                                {isSelected ? (
                                  <Check size={16} className="mt-0.5 shrink-0" />
                                ) : null}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <label className="block text-sm text-slate-700">
                <span className="mb-1.5 block font-medium">Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                  placeholder={
                    modalType === "increase"
                      ? "Contoh: barang datang dari PO"
                      : "Contoh: barang rusak atau expired"
                  }
                />
              </label>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAdjustmentModal}
                  disabled={submitting}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Menyimpan..." : "Simpan Audit Trail"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default ProductStockPage;
