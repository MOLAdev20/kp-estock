import { isAxiosError } from "axios";
import { ChevronRight, ClipboardList, Home, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import stockOpnameServices from "../services/stockOpnameServices";
import type { StockOpname } from "../types";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const StockOpnamePage = () => {
  const navigate = useNavigate();
  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [racks, setRacks] = useState<string[]>([]);
  const [racksLoading, setRacksLoading] = useState(false);
  const [selectedRack, setSelectedRack] = useState("");

  const fetchOpnames = async () => {
    try {
      setLoading(true);
      const data = await stockOpnameServices.getOpnames();
      setOpnames(data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      toast.error("Gagal memuat data stok opname");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Stock Opname | EStock";
    fetchOpnames();
  }, []);

  const openModal = async () => {
    setSelectedRack("");
    setModalOpen(true);

    try {
      setRacksLoading(true);
      const data = await stockOpnameServices.getRacks();
      setRacks(data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      toast.error("Gagal memuat daftar rak");
      console.log(error);
    } finally {
      setRacksLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRack("");
  };

  const handleStartOpname = () => {
    if (!selectedRack) {
      toast.error("Silakan pilih rak terlebih dahulu");
      return;
    }

    navigate(`/stock-opname/create?rack=${encodeURIComponent(selectedRack)}`);
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Stock Opname</h1>
          <small>Audit stok fisik barang dan hitung selisihnya dengan sistem</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <Home size={16} />
          <ChevronRight size={16} />
          <span>Stock Opname</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Riwayat Opname</h2>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          <Plus size={16} />
          Mulai Opname
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Kode Opname
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Rak / Catatan
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Jumlah Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Petugas
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Tanggal
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
                    Memuat data stok opname...
                  </td>
                </tr>
              ) : opnames.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Belum ada riwayat stok opname.
                  </td>
                </tr>
              ) : (
                opnames.map((opname) => (
                  <tr
                    key={opname.id}
                    onClick={() => navigate(`/stock-opname/${opname.id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      <span className="inline-flex items-center gap-1.5">
                        <ClipboardList size={14} className="text-slate-400" />
                        {opname.opnameCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {opname.notes ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">
                      {opname.totalItems ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {opname.user?.username ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDateTime(opname.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-800">
                Mulai Stock Opname
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4">
              <label
                htmlFor="rack"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Pilih Rak Produk
              </label>
              <select
                id="rack"
                value={selectedRack}
                onChange={(event) => setSelectedRack(event.target.value)}
                disabled={racksLoading}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none disabled:bg-slate-50"
              >
                <option value="">
                  {racksLoading ? "Memuat rak..." : "-- Pilih rak --"}
                </option>
                {racks.map((rack) => (
                  <option key={rack} value={rack}>
                    {rack}
                  </option>
                ))}
              </select>
              {!racksLoading && racks.length === 0 ? (
                <p className="mt-2 text-xs text-amber-600">
                  Belum ada rak produk yang tersedia.
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleStartOpname}
                disabled={!selectedRack}
                className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Lanjut Opname
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default StockOpnamePage;
