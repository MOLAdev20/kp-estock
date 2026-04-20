import { useEffect, useState } from "react";
import {
  Calculator,
  ChevronRight,
  Database,
  Home,
  Menu,
  NotebookPen,
} from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";
import type { Product } from "../types";
import { InputField, SelectOption } from "../components/ui/InputField";
import { useParams } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Product>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const onSubmit: SubmitHandler<Product> = (data) => {
    api
      .post("product/new", data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        toast.success("Data produk berhasil ditambahkan");
        reset();
      })
      .catch(() => {
        toast.error("Data Produk Gagal Ditambahkan");
      });
  };

  const checkSkuValidate = async (sku: string) => {
    try {
      await api.get("product/check-sku/" + sku);
      return true;
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        return "SKU tersebut sudah digunakan";
      }
      return "Gagal cek SKU, periksa koneksi internet anda";
    }
  };

  const fetchProductData = async () => {
    try {
      const data = await api.get("product/" + id);
      console.log(data);
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    document.title = "Tambah Data Produk | EStock";
    fetchProductData();
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
                  <h1 className="text-4xl">Edit Produk</h1>
                  <small>Edit data produk di sini</small>
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
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-12"
              >
                <Toaster />
                <div className="md:col-span-4">
                  <InputField
                    label="SKU Produk"
                    type="text"
                    id="product-sku"
                    register={register("product_sku", {
                      required: "SKU produk harus diisi",
                      validate: checkSkuValidate,
                    })}
                    error={errors.product_sku}
                  />
                </div>
                <div className="md:col-span-4">
                  <InputField
                    label="Nama Produk"
                    type="text"
                    id="product-name"
                    register={register("product_title", {
                      required: "Nama produk harus diisi",
                    })}
                    error={errors.product_title}
                  />
                </div>
                <div className="md:col-span-4">
                  <SelectOption
                    label="Kategori"
                    id="product-category"
                    register={register("category", {
                      required: "Tentukan kategori produk",
                    })}
                    options={[
                      { value: "Bahan Pokok", label: "Bahan Pokok" },
                      { value: "Bumbu Dapur", label: "Bumbu Dapur" },
                    ]}
                    error={errors.category}
                  />
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor="product-unit"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Satuan
                  </label>
                  <select
                    id="product-unit"
                    {...register("unit", {
                      required: "Tentukan satuan produk",
                    })}
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
                  {errors.unit && (
                    <small className="text-red-500 text-xs">
                      {errors.unit.message}
                    </small>
                  )}
                </div>
                <div className="md:col-span-4">
                  <InputField
                    label="Harga Beli"
                    type="number"
                    id="buying-price"
                    register={register("cost_price", {
                      required: "Harga beli produk harus diisi",
                    })}
                    error={errors.cost_price}
                    currencyPrefix="Rp"
                  />
                </div>
                <div className="md:col-span-4">
                  <InputField
                    label="Harga Jual"
                    type="number"
                    id="selling-price"
                    register={register("selling_price", {
                      required: "Harga jual produk harus diisi",
                      min: {
                        value: 500,
                        message: "Harga jual tidak boleh < 500",
                      },
                    })}
                    currencyPrefix="Rp"
                    error={errors.selling_price}
                  />
                </div>
                <div className="md:col-span-4">
                  <InputField
                    label="Jumlah Stok"
                    id="product-stock"
                    register={register("stock", {
                      required: "Stok produk harus diisi",
                    })}
                    type="number"
                    unit={!watch("unit") ? "kg" : watch("unit")}
                    error={errors.stock}
                  />
                </div>
                <div className="md:col-span-4">
                  <InputField
                    label="Stok Minimum"
                    id="minimum-stock"
                    type="number"
                    register={register("minimum_stock", {
                      required: "Tentukan stok minimum produk",
                    })}
                    error={errors.minimum_stock}
                    unit={!watch("unit") ? "kg" : watch("unit")}
                  />
                </div>
                <div className="md:col-span-4">
                  <InputField
                    label="Lokasi Rak"
                    id="rack-location"
                    type="text"
                    register={register("rack", {
                      required: "Lokasi rak harus diisi",
                    })}
                    error={errors.rack}
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
                    {...register("description")}
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    hover:border-slate-400"
                    placeholder="Berikan deskripsi produk di sini (opsional"
                  ></textarea>
                </div>
                <div className="md:col-span-12">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`rounded-lg flex gap-1 items-center justify-center shadow bg-red-500 hover:bg-red-600 p-3 w-full text-white cursor-pointer active:scale-95 transition-transform disabled:cursor-not-allowed disabled:bg-red-300 disabled:scale-100`}
                  >
                    {isSubmitting ? <Spinner size="sm" /> : null}
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* End of Content */}
      </div>
      {/* End of Wrapper */}
    </>
  );
};

export default EditProduct;
