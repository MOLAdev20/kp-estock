import { useEffect, useState } from "react";
import { ChevronRight, Home, Pencil, Plus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
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
        <a
          href="/add-product"
          className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-600 active:scale-95"
        >
          <Plus size={16} />
          Tambah
        </a>
        <div className="bg-white mt-3 rounded-lg shadow">
          <div className="p-1 bg-red-500 rounded-t text-white text-sm">
            <h1>Tabel Produk</h1>
          </div>
          <div className="min-w-full mt-2 p-3">
            <div className="border border-table-line overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
              <table className="min-w-full divide-y divide-table-line">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                    >
                      No
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                    >
                      SKU
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                    >
                      Produk
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                    >
                      Stok
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-end text-xs font-medium text-muted-foreground-1 uppercase"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-table-line">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-sm text-slate-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-sm text-slate-500"
                      >
                        Tidak ada data produk.
                      </td>
                    </tr>
                  ) : (
                    data.map((item: Product) => (
                      <tr key={item.uuid}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {item.uuid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {item.product_sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {item.product_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {item.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                          <a
                            href="/edit-product"
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </a>
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
      </div>
    </AdminLayout>
  );
};

export default ProductPage;
