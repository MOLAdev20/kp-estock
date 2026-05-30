import { isAxiosError } from "axios";
import { ChevronRight, Download, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

const formatCompactDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const TransactionSummaryPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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

  const handleDownloadReceipt = async () => {
    if (!data || downloadingPdf) {
      return;
    }

    try {
      setDownloadingPdf(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const rightEdge = pageWidth - 14;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("EStock", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Struk Transaksi", 14, 24);
      doc.text(`Kode: ${data.transaction_code}`, 14, 30);
      doc.text(`Tanggal: ${formatCompactDateTime(data.created_at)}`, 14, 35);

      doc.text(`Kasir: ${data.user.username}`, rightEdge, 24, {
        align: "right",
      });
      doc.text(`Metode Bayar: ${data.payment_method}`, rightEdge, 29, {
        align: "right",
      });

      autoTable(doc, {
        startY: 42,
        head: [["Produk", "SKU", "Harga", "Qty", "Total"]],
        body: data.transaction_items.map((item) => [
          item.product.product_title,
          item.product.product_sku,
          formatCurrency(Number(item.unit_price)),
          String(item.qty),
          formatCurrency(Number(item.total)),
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 2.8,
          textColor: [30, 41, 59],
        },
        headStyles: {
          fillColor: [239, 68, 68],
          textColor: [255, 255, 255],
        },
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
      });

      const finalY =
        (
          doc as jsPDF & { lastAutoTable?: { finalY: number } }
        ).lastAutoTable?.finalY ?? 42;
      const summaryStartY = finalY + 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal", 132, summaryStartY);
      doc.text(formatCurrency(Number(data.total_price)), rightEdge, summaryStartY, {
        align: "right",
      });

      doc.text("Diskon", 132, summaryStartY + 6);
      doc.text(
        data.discount_type === "percent"
          ? `${data.discount_amount}%`
          : formatCurrency(Number(data.discount_amount)),
        rightEdge,
        summaryStartY + 6,
        { align: "right" },
      );

      doc.setFont("helvetica", "bold");
      doc.text("Total Bayar", 132, summaryStartY + 14);
      doc.text(
        formatCurrency(Number(data.grand_total)),
        rightEdge,
        summaryStartY + 14,
        { align: "right" },
      );

      doc.setDrawColor(226, 232, 240);
      doc.line(14, summaryStartY + 20, rightEdge, summaryStartY + 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        "Dokumen ini dibuat otomatis oleh EStock.",
        14,
        summaryStartY + 28,
      );

      const safeCode = data.transaction_code.replace(/[^a-z0-9-_]+/gi, "_");
      doc.save(`struk-${safeCode}.pdf`);
    } catch {
      toast.error("Gagal membuat PDF struk");
    } finally {
      setDownloadingPdf(false);
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
                  onClick={handleDownloadReceipt}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Download size={16} />
                  {downloadingPdf ? "Membuat PDF..." : "Download Struk"}
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
