import { useEffect, useState, type ReactNode } from "react";
import {
  Menu,
  Database,
  Calculator,
  ChevronDown,
  Warehouse,
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isSuperAdminRole } from "../../utils/role";
import { markSkipAuthRedirectMessage } from "../../utils/authRedirect";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [transactionMenuOpen, setTransactionMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const showUserManagementMenu = isSuperAdminRole(user?.role);

  const pathname = location.pathname;
  const isDashboardActive = pathname === "/dashboard";
  const isProductActive =
    pathname === "/products" ||
    pathname === "/add-product" ||
    pathname.startsWith("/edit-product/");
  const isTransactionListActive =
    pathname === "/transaction" ||
    (pathname.startsWith("/transaction/") &&
      pathname !== "/transaction/create");
  const isTransactionCreateActive = pathname === "/transaction/create";
  const isTransactionActive =
    isTransactionListActive || isTransactionCreateActive;
  const isStockManagementActive = pathname.startsWith("/stock-management");
  const isSupplierManagementActive = pathname === "/suppliers";
  const isUserManagementActive = pathname === "/users";
  const isStockOpnameActive = pathname.startsWith("/stock-opname");

  useEffect(() => {
    setTransactionMenuOpen(isTransactionActive);
  }, [isTransactionActive]);

  const getMenuClassName = (isActive: boolean) =>
    `w-full py-2 px-3 flex items-center gap-1 rounded-md transition-colors ${
      isActive
        ? "bg-red-500 text-white"
        : "text-slate-700 hover:text-white hover:bg-red-500"
    }`;

  const getSubMenuClassName = (isActive: boolean) =>
    `py-2 px-3 flex items-center gap-1 rounded-md transition-colors text-sm ${
      isActive
        ? "bg-red-50 text-red-600"
        : "text-slate-600 hover:text-red-600 hover:bg-slate-50"
    }`;

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah anda yakin ingin logout?");

    if (!confirmLogout) {
      return;
    }

    markSkipAuthRedirectMessage();
    await logout();
    setMobileSidebarOpen(false);
    navigate("/", { replace: true });
  };

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
              to="/dashboard"
              onClick={() => setMobileSidebarOpen(false)}
              className={() => getMenuClassName(isDashboardActive)}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setMobileSidebarOpen(false)}
              className={() => getMenuClassName(isProductActive)}
            >
              <Database size={18} />
              <span>Master Produk</span>
            </NavLink>
            <div>
              <button
                type="button"
                onClick={() => setTransactionMenuOpen((prev) => !prev)}
                className={`${getMenuClassName(isTransactionActive || transactionMenuOpen)} justify-start text-left`}
              >
                <Calculator size={18} />
                <span>Transaksi</span>
                <ChevronDown
                  size={16}
                  className={`ml-auto transition-transform ${
                    transactionMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {transactionMenuOpen ? (
                <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-slate-200 pl-3">
                  <NavLink
                    to="/transaction"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={() =>
                      getSubMenuClassName(isTransactionListActive)
                    }
                  >
                    <span>Data Transaksi</span>
                  </NavLink>
                  <NavLink
                    to="/transaction/create"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={() =>
                      getSubMenuClassName(isTransactionCreateActive)
                    }
                  >
                    <span>Buat Transaksi</span>
                  </NavLink>
                </div>
              ) : null}
            </div>
            <NavLink
              to="/suppliers"
              onClick={() => setMobileSidebarOpen(false)}
              className={() => getMenuClassName(isSupplierManagementActive)}
            >
              <Building2 size={18} />
              <span>Supplier</span>
            </NavLink>
            <NavLink
              to="/stock-management"
              onClick={() => setMobileSidebarOpen(false)}
              className={() => getMenuClassName(isStockManagementActive)}
            >
              <Warehouse size={18} />
              <span>Stock Management</span>
            </NavLink>
            <NavLink
              to="/stock-opname"
              onClick={() => setMobileSidebarOpen(false)}
              className={() => getMenuClassName(isStockOpnameActive)}
            >
              <ClipboardList size={18} />
              <span>Stock Opname</span>
            </NavLink>
            {showUserManagementMenu ? (
              <NavLink
                to="/users"
                onClick={() => setMobileSidebarOpen(false)}
                className={() => getMenuClassName(isUserManagementActive)}
              >
                <Users size={18} />
                <span>Manajemen User</span>
              </NavLink>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              className="py-2 px-3 text-slate-700 hover:text-white hover:bg-red-500 transition-colors flex items-center gap-1 rounded-md cursor-pointer text-left"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
        {/* End of Sidebar */}

        {/* Content */}
        <div className="bg-slate-50 mt-14 md:ml-64 w-full">
          <div className="flex min-h-[calc(100vh-3.5rem)] flex-col p-5">
            <div>{children}</div>
            <footer className="mt-auto pt-8 text-center text-xs text-slate-400">
              Copyright 2026 Kelompok 11 Rekayasa Perangkat Lunak
            </footer>
          </div>
        </div>
        {/* End of Content */}
      </div>
      {/* End of wrapper */}
    </>
  );
};

export default AdminLayout;
