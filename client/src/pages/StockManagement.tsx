import { isAxiosError } from "axios";
import { ChevronRight, Home, Pencil, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import stockManagementServices from "../services/stockManagementServices";
import type { StockManagementProduct, StockStatus } from "../types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const stockStatusConfig: Record<
  StockStatus,
  { label: string; className: string; textClassName: string }
> = {
  safe: {
    label: "Aman",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    textClassName: "text-emerald-700",
  },
  low: {
    label: "Menipis",
    className: "bg-amber-50 text-amber-700 border-amber-100",
    textClassName: "text-amber-700",
  },
  critical: {
    label: "Kritis",
    className: "bg-red-50 text-red-700 border-red-100",
    textClassName: "text-red-700",
  },
};

const extractErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || "Gagal memperbarui stok produk";
  }

  return "Gagal memperbarui stok produk";
};

const StockManagementPage = () => {
  const [products, setProducts] = useState<StockManagementProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<StockManagementProduct | null>(null);
  const [stockInput, setStockInput] = useState("");

  const lowStockCount = useMemo(
    () =>
      products.filter(
        (product) =>
          product.stockStatus === "low" || product.stockStatus === "critical",
      ).length,
    [products],
  );

  const fetchStockProducts = async () => {
    try {
      setLoading(true);
      const data = await stockManagementServices.getStockProducts();
      setProducts(data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      toast.error("Gagal memuat data stok produk");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product: StockManagementProduct) => {
    setSelectedProduct(product);
    setStockInput(String(product.stock));
  };

  const closeEditModal = () => {
    setSelectedProduct(null);
    setStockInput("");
  };

  const submitEditStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const stockValue = Number(stockInput);

    if (!Number.isInteger(stockValue) || stockValue < 0) {
      toast.error("Stok harus berupa bilangan bulat dan tidak negatif");
      return;
    }

    try {
      setUpdating(true);
      const updated = await stockManagementServices.updateProductStock(
        selectedProduct.uuid,
        { stock: stockValue },
      );

      setProducts((prev) =>
        prev.map((item) => (item.uuid === updated.uuid ? updated : item)),
      );
      toast.success("Stok produk berhasil diperbarui");
      closeEditModal();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    document.title = "Stock Management | EStock";
    fetchStockProducts();
  }, []);

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Stock Management</h1>
          <small>Monitoring stok produk dan update cepat dari satu halaman</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <Home size={16} />
          <ChevronRight size={16} />
          <span>Stock Management</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Produk
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-800">
            {products.length}
          </h2>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-amber-700">
            Perlu Restock
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-amber-700">
            {lowStockCount}
          </h2>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Monitoring Stok Produk
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Produk
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Harga
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Stok
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Memuat data stok produk...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Data produk belum tersedia.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const config = stockStatusConfig[product.stockStatus];

                  return (
                    <tr key={product.uuid}>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        <p className="font-medium">{product.productTitle}</p>
                        <p className="text-xs text-slate-500">
                          Min. stok {product.minimumStock}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {formatCurrency(product.sellingPrice)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-sm font-semibold ${config.textClassName}`}
                      >
                        {product.stock}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-red-100 p-2 text-red-600">
                <Warehouse size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Edit Stok Produk
                </h3>
                <p className="text-sm text-slate-600">
                  {selectedProduct.productTitle}
                </p>
              </div>
            </div>

            <form className="mt-4" onSubmit={submitEditStock}>
              <label
                htmlFor="stock-input"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Jumlah Stok Baru
              </label>
              <input
                id="stock-input"
                type="number"
                min={0}
                value={stockInput}
                onChange={(event) => setStockInput(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none"
                placeholder="Masukkan jumlah stok"
                required
              />
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {updating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default StockManagementPage;
