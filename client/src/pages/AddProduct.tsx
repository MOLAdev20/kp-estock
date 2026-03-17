import { useEffect, useState } from "react";
import {
  Calculator,
  ChevronRight,
  Database,
  Home,
  Menu,
  NotebookPen,
} from "lucide-react";

const AddProduct = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = "Tambah Data Produk | EStock";
  }, []);

  return (
    <>
      {/* Topbar */}
      <div className="fixed h-14 z-40 left-0 shadow bg-white inset-x-0 px-5 ">
        <div className="flex gap-2 items-center justify-between">
          <div className="leading-none">
            <div className="text-2xl font-medium flex gap-1">
              <span className="text-red-500 font-bold">E</span>
              <span>Stock</span>
            </div>
            <small className="text-xs text-slate-500">
              Sistem Manajemen Stok Opname
            </small>
          </div>
          <button
            className="cursor-pointer active:scale-90 p-1 bg-slate-100 rounded block sm:hidden"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
      {/* End of Topbar */}

      {/* Wrapper */}
      <div className="flex">
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black opacity-30 z-10 ${mobileSidebarOpen ? "block" : "hidden"}`}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        {/* End of Overlay */}

        {/* Sidebar */}
        <div
          className={`w-64 p-5 mt-14 h-screen bg-white shadow fixed z-20 ${mobileSidebarOpen ? " md:translate-x-0" : "md:translate-x-0 -translate-x-full"} transition-transform`}
        >
          <h1 className="text-sm">Menu</h1>
          <div className="mt-3 flex flex-col gap-1">
            <a
              href="#"
              className="py-2 px-3 text-slate-700 flex items-center gap-1 rounded-md hover:text-white hover:bg-red-500 transition-colors"
            >
              <Database size={18} />
              <span>Master Produk</span>
            </a>
            <a
              href="#"
              className="py-2 px-3 text-slate-700 flex items-center gap-1 rounded-md hover:text-white hover:bg-red-500 transition-colors"
            >
              <Calculator size={18} />
              <span>Stok Opname</span>
            </a>
          </div>
        </div>
        {/* End of Sidebar */}

        {/* Content */}
        <div className="bg-slate-50 mt-14 md:ml-64 w-full">
          <div className="p-5">
            <div className="sm:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-4 flex items-center justify-center bg-red-500 shadow rounded-lg text-white">
                  <NotebookPen size={20} />
                </div>
                <div>
                  <h1 className="text-4xl">Input Produk</h1>
                  <small>Kelola data produk di sini</small>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <Home size={18} />
                <ChevronRight size={18} />
                <span>Master Produk</span>
              </div>
            </div>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-base font-semibold text-slate-800">
                  Detail Produk
                </h2>
                <p className="text-xs text-slate-500">
                  Lengkapi informasi utama produk untuk stok yang rapi.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-12">
                <div className="md:col-span-3">
                  <label
                    htmlFor="product-sku"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    SKU Produk
                  </label>
                  <input
                    type="text"
                    id="product-sku"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    hover:border-slate-400"
                  />
                </div>
                <div className="md:col-span-5">
                  <label
                    htmlFor="product-name"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    id="product-name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    hover:border-slate-400"
                  />
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor="product-category"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Kategori
                  </label>
                  <select
                    id="product-category"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-400 cursor-pointer"
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Bahan Pokok">Bahan Pokok</option>
                    <option value="Bumbu Dapur">Bumbu Dapur</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label
                    htmlFor="product-unit"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Satuan
                  </label>
                  <select
                    id="product-unit"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-400 cursor-pointer"
                  >
                    <option value="">Pilih Satuan</option>
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="liter">liter</option>
                    <option value="butir">butir</option>
                    <option value="bungkus">bungkus</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor="buying-price"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Harga Beli
                  </label>
                  <div className="flex">
                    <div className="flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 px-3 text-xs font-semibold text-slate-600">
                      Rp
                    </div>
                    <input
                      type="number"
                      id="buying-price"
                      className="w-full rounded-r-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                      hover:border-slate-400"
                    />
                  </div>
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor="selling-price"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Harga Jual
                  </label>
                  <div className="flex">
                    <div className="flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 px-3 text-xs font-semibold text-slate-600">
                      Rp
                    </div>
                    <input
                      type="number"
                      id="selling-price"
                      className="w-full rounded-r-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                      hover:border-slate-400"
                    />
                  </div>
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor="product-stock"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Jumlah Stok
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      id="product-stock"
                      className="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                      hover:border-slate-400"
                    />
                    <div className="flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-100 px-3 text-xs font-semibold text-slate-600">
                      Kg
                    </div>
                  </div>
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor="minimum-stock"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Stok Minimum
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      id="minimum-stock"
                      className="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                      hover:border-slate-400"
                    />
                    <div className="flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-100 px-3 text-xs font-semibold text-slate-600">
                      Kg
                    </div>
                  </div>
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor="rack-location"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Lokasi Rak
                  </label>
                  <input
                    type="text"
                    id="rack-location"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    hover:border-slate-400"
                  />
                </div>
                <div className="md:col-span-12">
                  <label
                    htmlFor="product-description"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Deskripsi
                  </label>
                  <textarea
                    id="product-description"
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    hover:border-slate-400"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End of Content */}
      </div>
      {/* End of Wrapper */}
    </>
  );
};

export default AddProduct;
