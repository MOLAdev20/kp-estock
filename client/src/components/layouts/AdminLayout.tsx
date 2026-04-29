import { useState, type ReactNode } from "react";
import { Menu, Database, Calculator, Warehouse } from "lucide-react";
import { NavLink } from "react-router-dom";

const AdminLayout = ({ children }: { children: ReactNode }) => {
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
      {/* End of topbar */}

      {/* Wrapper */}
      <div className="flex">
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black opacity-30 z-10 ${mobileSidebarOpen ? "block" : "hidden"}`}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        {/* End of overlay */}

        {/* Sidebar */}
        <div
          className={`w-64 p-5 mt-14 h-screen bg-white shadow fixed z-20 ${mobileSidebarOpen ? " md:translate-x-0" : "md:translate-x-0 -translate-x-full"} transition-transform`}
        >
          <h1 className="text-sm">Menu</h1>
          <div className="mt-3 flex flex-col gap-1">
            <NavLink
              to="/products"
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `py-2 px-3 flex items-center gap-1 rounded-md transition-colors ${
                  isActive
                    ? "bg-red-500 text-white"
                    : "text-slate-700 hover:text-white hover:bg-red-500"
                }`
              }
            >
              <Database size={18} />
              <span>Master Produk</span>
            </NavLink>
            <NavLink
              to="/transaction"
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `py-2 px-3 flex items-center gap-1 rounded-md transition-colors ${
                  isActive
                    ? "bg-red-500 text-white"
                    : "text-slate-700 hover:text-white hover:bg-red-500"
                }`
              }
            >
              <Calculator size={18} />
              <span>Transaksi</span>
            </NavLink>
            <NavLink
              to="/stock-management"
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `py-2 px-3 flex items-center gap-1 rounded-md transition-colors ${
                  isActive
                    ? "bg-red-500 text-white"
                    : "text-slate-700 hover:text-white hover:bg-red-500"
                }`
              }
            >
              <Warehouse size={18} />
              <span>Stock Management</span>
            </NavLink>
          </div>
        </div>
        {/* End of Sidebar */}

        {/* Content */}
        <div className="bg-slate-50 mt-14 md:ml-64 w-full">
          <div className="p-5">{children}</div>
        </div>
        {/* End of Content */}
      </div>
      {/* End of wrapper */}
    </>
  );
};

export default AdminLayout;
