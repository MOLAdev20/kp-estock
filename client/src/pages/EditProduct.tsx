import AdminLayout from "../components/layouts/AdminLayout";
import { Home, ChevronRight } from "lucide-react";

const EditProduct = () => {
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
          <span>Edit Produk</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditProduct;
