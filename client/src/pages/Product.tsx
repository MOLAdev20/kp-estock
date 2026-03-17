import { useState } from "react";
import { Calculator, ChevronRight, Database, Home, Menu } from "lucide-react";

const Product = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
            <div className="rounded-lg shadow bg-white mt-8 h-full">
              <div className="p-1 bg-slate-500 rounded-t text-white text-sm">
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
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                        >
                          Age
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                        >
                          Address
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-end text-xs font-medium text-muted-foreground-1 uppercase"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-table-line">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          John Brown
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          45
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          New York No. 1 Lake Park
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                          <button
                            type="button"
                            className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg text-primary hover:text-primary-hover focus:outline-hidden focus:text-primary-focus disabled:opacity-50 disabled:pointer-events-none"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>

                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          Jim Green
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          27
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          London No. 1 Lake Park
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                          <button
                            type="button"
                            className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg text-primary hover:text-primary-hover focus:outline-hidden focus:text-primary-focus disabled:opacity-50 disabled:pointer-events-none"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>

                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          Joe Black
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          31
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          Sidney No. 1 Lake Park
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                          <button
                            type="button"
                            className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg text-primary hover:text-primary-hover focus:outline-hidden focus:text-primary-focus disabled:opacity-50 disabled:pointer-events-none"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

export default Product;
