import { isAxiosError } from "axios";
import { ChevronRight, Home } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import stockOpnameServices from "../services/stockOpnameServices";
import type { StockOpname } from "../types";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const varianceClassName = (variance: number) => {
  if (variance > 0) {
    return "text-amber-700";
  }

  if (variance < 0) {
    return "text-red-700";
  }

  return "text-emerald-700";
};

const StockOpnameDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [opname, setOpname] = useState<StockOpname | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Detail Stock Opname | EStock";

    if (!id) {
      navigate("/stock-opname");
      return;
    }

    const fetchOpname = async () => {
      try {
        setLoading(true);
        const data = await stockOpnameServices.getOpname(id);
        setOpname(data);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return;
        }

        toast.error("Gagal memuat detail stok opname");
        navigate("/stock-opname");
      } finally {
        setLoading(false);
      }
    };

    fetchOpname();
  }, [id, navigate]);

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Detail Stock Opname</h1>
          <small>{opname?.opnameCode ?? "Memuat..."}</small>
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
          <span>Detail</span>
        </div>
      </div>

      {opname ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Catatan
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-800">
              {opname.notes ?? "-"}
            </h2>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Petugas
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-800">
              {opname.user?.username ?? "-"}
            </h2>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Tanggal
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-800">
              {formatDateTime(opname.createdAt)}
            </h2>
          </div>
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Hasil Penghitungan
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
                    Memuat detail...
                  </td>
                </tr>
              ) : !opname?.items || opname.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Tidak ada item pada opname ini.
                  </td>
                </tr>
              ) : (
                opname.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      <p className="font-medium">{item.productTitle ?? "-"}</p>
                      <p className="text-xs text-slate-500">
                        {item.productSku ?? "-"} • {item.unit ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      {item.systemStock}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">
                      {item.physicalStock}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-sm font-semibold ${varianceClassName(
                        item.variance,
                      )}`}
                    >
                      {item.variance > 0 ? `+${item.variance}` : item.variance}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StockOpnameDetailPage;
