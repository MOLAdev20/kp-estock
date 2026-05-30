import { useEffect, useState, type ChangeEvent } from "react";
import {
  ChevronRight,
  Home,
  ImagePlus,
  NotebookPen,
} from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import { isAxiosError } from "axios";
import type { Product } from "../types";
import { InputField, SelectOption } from "../components/ui/InputField";
import { useNavigate, useParams } from "react-router-dom";
import services from "../services/productServices";
import AdminLayout from "../components/layouts/AdminLayout";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loadingProduct, setLoadingProduct] = useState<boolean>(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState<boolean>(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [initialSku, setInitialSku] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Product>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const getThumbnailPreviewUrl = (thumbnail: string | null | undefined) => {
    if (!thumbnail) {
      return "";
    }

    if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
      return thumbnail;
    }

    try {
      return new URL(thumbnail, import.meta.env.VITE_API_URL).toString();
    } catch {
      return thumbnail;
    }
  };

  const onSubmit: SubmitHandler<Product> = async (data) => {
    if (!id) {
      toast.error("ID produk tidak ditemukan");
      return;
    }

    try {
      await services.updateProduct(id, data);
      toast.success("Data produk berhasil diperbarui");
      navigate("/products", { replace: true });
    } catch {
      toast.error("Data Produk Gagal Diperbarui");
    }
  };

  const checkSkuValidate = async (sku: string) => {
    if (sku.trim() === initialSku) {
      return true;
    }

    try {
      await services.validateSku(sku);
      return true;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        return "SKU tersebut sudah digunakan";
      }

      return "Gagal cek SKU, periksa koneksi internet anda";
    }
  };

  const fetchProductData = async () => {
    if (!id) {
      toast.error("ID produk tidak ditemukan");
      navigate("/products", { replace: true });
      return;
    }

    try {
      setLoadingProduct(true);
      const product = await services.getProduct(id);

      setInitialSku(product.product_sku);
      setThumbnailPreview(getThumbnailPreviewUrl(product.thumbnail));
      reset({
        ...product,
        cost_price: Number(product.cost_price),
        selling_price: Number(product.selling_price),
        stock: Number(product.stock),
        minimum_stock: Number(product.minimum_stock),
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        toast.error("Produk tidak ditemukan");
      } else {
        toast.error("Gagal memuat data produk");
      }

      navigate("/products", { replace: true });
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleThumbnailUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !id) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      event.target.value = "";
      return;
    }

    try {
      setUploadingThumbnail(true);
      const updatedProduct = await services.uploadThumbnail(id, file);
      const latestThumbnail = updatedProduct.thumbnail ?? null;

      setValue("thumbnail", latestThumbnail);
      setThumbnailPreview(getThumbnailPreviewUrl(latestThumbnail));
      toast.success("Foto produk berhasil diupload");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 413) {
        toast.error("Ukuran foto maksimal 2MB");
      } else if (isAxiosError(err) && err.response?.status === 415) {
        toast.error("Format foto harus JPG, PNG, atau WEBP");
      } else if (isAxiosError(err) && err.response?.status === 404) {
        toast.error("Produk tidak ditemukan");
      } else {
        toast.error("Gagal upload foto produk");
      }
    } finally {
      setUploadingThumbnail(false);
      event.target.value = "";
    }
  };

  useEffect(() => {
    document.title = "Edit Data Produk | EStock";
    fetchProductData();
  }, [id]);

  return (
    <AdminLayout>
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
          {loadingProduct ? (
            <div className="md:col-span-12 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Memuat data produk...
            </div>
          ) : null}
          <div className="md:col-span-12 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Foto Produk
                  </h3>
                  <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-white text-xs text-slate-500">
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail produk"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>Belum ada foto</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="thumbnail-upload"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Upload Thumbnail
                      </label>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleThumbnailUpload}
                        disabled={loadingProduct || uploadingThumbnail}
                        className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Format JPG, PNG, WEBP. Maksimal 2MB.
                      </p>
                      {uploadingThumbnail ? (
                        <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
                          <Spinner size="sm" />
                          Mengupload foto...
                        </div>
                      ) : null}
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <ImagePlus size={14} />
                        <span>Upload setelah produk tersimpan.</span>
                      </div>
                    </div>
                  </div>
          </div>
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
              disabled={isSubmitting || loadingProduct}
              className={`rounded-lg flex gap-1 items-center justify-center shadow bg-red-500 hover:bg-red-600 p-3 w-full text-white cursor-pointer active:scale-95 transition-transform disabled:cursor-not-allowed disabled:bg-red-300 disabled:scale-100`}
            >
              {isSubmitting || loadingProduct ? <Spinner size="sm" /> : null}
              {isSubmitting
                ? "Menyimpan..."
                : loadingProduct
                  ? "Menyiapkan Form..."
                  : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditProduct;
