import { isAxiosError } from "axios";
import { ChevronRight, Download, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import transactionServices, {
  type TransactionDetail,
} from "../services/transactionServices";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));

const TransactionSummaryPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TransactionDetail | null>(null);

  useEffect(() => {
    document.title = "Summary Transaksi | EStock";
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    if (!id) {
      toast.error("ID transaksi tidak valid");
      return;
    }

    try {
      setLoading(true);
      const detail = await transactionServices.getTransactionById(id);
      setData(detail);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Gagal memuat detail transaksi",
        );
      } else {
        toast.error("Gagal memuat detail transaksi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Summary Transaksi</h1>
          <small>Detail transaksi yang berhasil dilakukan</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <ReceiptText size={16} />
          <ChevronRight size={16} />
          <span>Summary</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Memuat detail transaksi...</p>
        ) : !data ? (
          <p className="text-sm text-slate-500">
            Data transaksi tidak ditemukan.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Kode Transaksi
                </p>
                <h2 className="text-xl font-bold text-slate-800">
                  {data.transaction_code}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDateTime(data.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Download size={16} />
                  Download Struk
                </button>
                <Link
                  to="/transaction"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  Kembali
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Kasir/User</p>
                <p className="text-sm font-semibold text-slate-800">
                  {data.user.username}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Metode Bayar</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">
                  {data.payment_method}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Discount</p>
                <p className="text-sm font-semibold text-slate-800">
                  {data.discount_type === "percent"
                    ? `${data.discount_amount}%`
                    : formatCurrency(Number(data.discount_amount))}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Grand Total</p>
                <p className="text-sm font-semibold text-red-500">
                  {formatCurrency(Number(data.grand_total))}
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Produk
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                      Harga Satuan
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.transaction_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">
                        {item.product.product_title}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.product.product_sku}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {formatCurrency(Number(item.unit_price))}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {item.qty}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                        {formatCurrency(Number(item.total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(data.total_price))}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-slate-700">
                <span>Diskon</span>
                <span>
                  {data.discount_type === "percent"
                    ? `${data.discount_amount}%`
                    : formatCurrency(Number(data.discount_amount))}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-bold text-red-500">
                <span>Total Bayar</span>
                <span>{formatCurrency(Number(data.grand_total))}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default TransactionSummaryPage;
