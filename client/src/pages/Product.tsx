import { useEffect, useState } from "react";
import { ChevronRight, Home, Pencil, Plus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import AdminLayout from "../components/layouts/AdminLayout";
import type { Product } from "../types";
import services from "../services/productServices";

const ProductPage = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Product";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const products = await services.getProducts();
      setData(products);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      toast.error("Gagal Memuat Data");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (uuid: string) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus produk ini?",
    );

    if (!confirm) return;

    try {
      setLoading(true);
      await services.deleteProduct(uuid);
      toast.success("Produk Berhasil Dihapus");
      setData((prev) => prev.filter((item) => item.uuid !== uuid));
    } catch (error) {
      toast.error("Gagal Menghapus Produk");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-4xl">Master Produk</h1>
          <small>Kelola data produk di sini</small>
        </div>
        <div className="flex items-center gap-1 mt-2 text-sm">
          <Home size={18} />
          <ChevronRight size={18} />
          <span>Master Produk</span>
        </div>
      </div>
      <Toaster />
      <div className="mt-8 h-full">
        <Link
          to="/add-product"
          className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-600 active:scale-95"
        >
          <Plus size={16} />
          Tambah
        </Link>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Daftar Produk
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Stok
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
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Tidak ada data produk.
                      </td>
                    </tr>
                  ) : (
                    data.map((item: Product, index) => (
                      <tr key={item.uuid}>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.product_sku}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800">
                          <p className="font-medium">{item.product_title}</p>
                          <p className="text-xs text-slate-500">{item.unit}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                          {item.stock}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <Link
                            to={`/edit-product/${item.uuid}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-100"
                          >
                            <Pencil size={14} />
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="ml-2 inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-red-600 transition-colors hover:bg-red-50"
                            onClick={() => deleteProduct(item.uuid)}
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
    </AdminLayout>
  );
};

export default ProductPage;
