import { isAxiosError } from "axios";
import { ChevronRight, Plus, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import transactionServices, {
  type TransactionListItem,
} from "../services/transactionServices";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const TransactionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TransactionListItem[]>([]);

  useEffect(() => {
    document.title = "Daftar Transaksi | EStock";
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const transactions = await transactionServices.getTransactions();
      setData(transactions);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      toast.error("Gagal memuat daftar transaksi");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Daftar Transaksi</h1>
          <small>Riwayat transaksi terbaru ditampilkan paling atas</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <ReceiptText size={16} />
          <ChevronRight size={16} />
          <span>Transaksi</span>
        </div>
      </div>

      <div className="mt-6">
        <Link
          to="/transaction/create"
          className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-600 active:scale-95"
        >
          <Plus size={16} />
          Buat Transaksi
        </Link>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Metode Bayar
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Item
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Grand Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      Memuat data transaksi...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  data.map((transaction) => {
                    const totalItems = transaction.transaction_items.reduce(
                      (sum, item) => sum + item.qty,
                      0,
                    );

                    return (
                      <tr
                        key={transaction.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(`/transaction/${transaction.id}`)}
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                          {transaction.transaction_code}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {transaction.user.username}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {transaction.payment_method}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">
                          {totalItems}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-red-500">
                          {formatCurrency(Number(transaction.grand_total))}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateTime(transaction.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TransactionPage;
