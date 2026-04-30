import { isAxiosError } from "axios";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronRight,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Chart from "chart.js/auto";
import AdminLayout from "../components/layouts/AdminLayout";
import dashboardServices from "../services/dashboardServices";
import type { DashboardOverview } from "../types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const monthlySeries = overview?.annual.monthlyRevenueSeries || [];

  const annualTransactions = useMemo(
    () =>
      monthlySeries.reduce(
        (total, month) => total + month.totalTransactions,
        0,
      ),
    [monthlySeries],
  );

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const data = await dashboardServices.getOverview();
      setOverview(data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      toast.error("Gagal memuat dashboard");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Dashboard | EStock";
    fetchOverview();
  }, []);

  useEffect(() => {
    if (!chartCanvasRef.current) {
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    chartInstanceRef.current = new Chart(chartCanvasRef.current, {
      type: "bar",
      data: {
        labels: monthlySeries.map((item) => item.monthLabel),
        datasets: [
          {
            label: "Pendapatan",
            data: monthlySeries.map((item) => item.totalRevenue),
            borderRadius: 8,
            backgroundColor: "#ef4444",
            hoverBackgroundColor: "#dc2626",
            maxBarThickness: 38,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => formatCurrency(Number(context.raw || 0)),
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                const numeric = Number(value);

                if (numeric >= 1_000_000_000) {
                  return `${Math.round(numeric / 1_000_000_000)}B`;
                }

                if (numeric >= 1_000_000) {
                  return `${Math.round(numeric / 1_000_000)}Jt`;
                }

                if (numeric >= 1_000) {
                  return `${Math.round(numeric / 1_000)}Rb`;
                }

                return numeric.toString();
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [monthlySeries]);

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Dashboard</h1>
          <small>Ringkasan produk dan transaksi dalam satu tampilan</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <BarChart3 size={16} />
          <ChevronRight size={16} />
          <span>Dashboard</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total Produk
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-800">
                {overview?.summary.totalProducts ?? 0}
              </h2>
            </div>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Boxes size={16} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-700">
                Pendapatan Hari Ini
              </p>
              <h2 className="mt-1 text-xl font-semibold text-emerald-700">
                {formatCurrency(overview?.summary.todayRevenue ?? 0)}
              </h2>
            </div>
            <div className="rounded-lg bg-white/70 p-2 text-emerald-700">
              <Wallet size={16} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-700">
                Pendapatan Bulan Ini
              </p>
              <h2 className="mt-1 text-xl font-semibold text-blue-700">
                {formatCurrency(overview?.summary.monthlyRevenue ?? 0)}
              </h2>
            </div>
            <div className="rounded-lg bg-white/70 p-2 text-blue-700">
              <ShoppingBag size={16} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-700">
                Produk Stok Menipis
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-amber-700">
                {overview?.summary.lowStockProducts ?? 0}
              </h2>
            </div>
            <div className="rounded-lg bg-white/70 p-2 text-amber-700">
              <AlertTriangle size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-4">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-1">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Top 5 Produk Terlaris
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <p className="px-4 py-6 text-sm text-slate-500">Memuat data...</p>
            ) : (overview?.topSellingProducts.length || 0) === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">
                Belum ada penjualan bulan ini.
              </p>
            ) : (
              overview?.topSellingProducts.map((product, index) => (
                <div key={product.productUuid} className="px-4 py-3">
                  <p className="text-xs text-slate-500">#{index + 1}</p>
                  <p className="text-sm font-medium text-slate-800">
                    {product.productTitle}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      {product.totalQty} terjual
                    </span>
                    <span className="font-medium text-red-500">
                      {formatCurrency(product.totalRevenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm relative">
            <p className="text-xs uppercase tracking-wide text-white absolute bg-red-600 top-0 left-0 right-0 rounded-t-xl p-2">
              Ringkasan Tahunan{" "}
              {overview?.annual.year ?? new Date().getFullYear()}
            </p>
            <div className="mt-8 flex flex-wrap items-end gap-6">
              <div>
                <p className="text-xs text-slate-500">Total Pendapatan</p>
                <h3 className="text-2xl font-semibold text-slate-800">
                  {formatCurrency(overview?.annual.totalRevenue ?? 0)}
                </h3>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Transaksi</p>
                <h3 className="text-lg font-semibold text-slate-700">
                  {annualTransactions}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-slate-700">
                Grafik Pendapatan Bulanan
              </h2>
            </div>
            <div className="h-[320px] w-full">
              <canvas ref={chartCanvasRef} />
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
