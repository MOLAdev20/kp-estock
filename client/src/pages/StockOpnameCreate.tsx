import { isAxiosError } from "axios";
import { ChevronRight, Home, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import stockOpnameServices from "../services/stockOpnameServices";
import type { OpnameRackProduct } from "../types";

const varianceClassName = (variance: number) => {
  if (variance > 0) {
    return "text-amber-700";
  }

  if (variance < 0) {
    return "text-red-700";
  }

  return "text-emerald-700";
};

const StockOpnameCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rack = (searchParams.get("rack") ?? "").trim();

  const [products, setProducts] = useState<OpnameRackProduct[]>([]);
  const [physicalStocks, setPhysicalStocks] = useState<Record<number, string>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Mulai Stock Opname | EStock";

    if (!rack) {
      toast.error("Rak belum dipilih");
      navigate("/stock-opname");
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await stockOpnameServices.getProductsByRack(rack);
        setProducts(data);
        setPhysicalStocks(
          data.reduce<Record<number, string>>((accumulator, product) => {
            accumulator[product.id] = "";
            return accumulator;
          }, {}),
        );
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return;
        }

        const message = isAxiosError(error)
          ? error.response?.data?.message
          : null;
        toast.error(message ?? "Gagal memuat produk pada rak ini");
        navigate("/stock-opname");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [rack, navigate]);

  const handlePhysicalChange = (productId: number, value: string) => {
    if (value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    setPhysicalStocks((previous) => ({
      ...previous,
      [productId]: value,
    }));
  };

  const filledCount = useMemo(
    () =>
      products.filter((product) => physicalStocks[product.id] !== "").length,
    [products, physicalStocks],
  );

  const allFilled = products.length > 0 && filledCount === products.length;

  const handleSubmit = async () => {
    if (!allFilled) {
      toast.error("Lengkapi stok fisik semua produk terlebih dahulu");
      return;
    }

    const items = products.map((product) => ({
      product_id: product.id,
      physical_stock: Number(physicalStocks[product.id]),
    }));

    try {
      setSubmitting(true);
      const opname = await stockOpnameServices.createOpname({ rack, items });
      toast.success("Stock opname berhasil disimpan");
      navigate(`/stock-opname/${opname.id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      const message = isAxiosError(error)
        ? error.response?.data?.message
        : null;
      toast.error(message ?? "Gagal menyimpan stock opname");
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Stock Opname Rak {rack}</h1>
          <small>Masukkan jumlah stok fisik hasil hitungan langsung</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <Home size={16} />
          <ChevronRight size={16} />
          <span
            className="cursor-pointer hover:text-slate-900"
            onClick={() => navigate("/stock-opname")}
          >
            Stock Opname
          </span>
          <ChevronRight size={16} />
          <span>Rak {rack}</span>
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
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Sudah Dihitung
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-800">
            {filledCount} / {products.length}
          </h2>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Penghitungan Stok Fisik
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
                  Stok Sistem
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Stok Fisik
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Selisih
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Memuat produk pada rak ini...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Tidak ada produk pada rak ini.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const rawValue = physicalStocks[product.id] ?? "";
                  const hasValue = rawValue !== "";
                  const variance = hasValue
                    ? Number(rawValue) - product.systemStock
                    : 0;

                  return (
                    <tr key={product.id}>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        <p className="font-medium">{product.productTitle}</p>
                        <p className="text-xs text-slate-500">
                          {product.productSku} • {product.unit}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                        {product.systemStock}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={rawValue}
                          onChange={(event) =>
                            handlePhysicalChange(product.id, event.target.value)
                          }
                          placeholder="0"
                          className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
                        />
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-sm font-semibold ${
                          hasValue ? varianceClassName(variance) : "text-slate-400"
                        }`}
                      >
                        {hasValue ? (variance > 0 ? `+${variance}` : variance) : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate("/stock-opname")}
          className="cursor-pointer rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allFilled || submitting}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} />
          {submitting ? "Menyimpan..." : "Simpan Opname"}
        </button>
      </div>
    </AdminLayout>
  );
};

export default StockOpnameCreatePage;
