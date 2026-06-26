import { isAxiosError } from "axios";
import {
  ChevronRight,
  Package,
  Search,
  ShoppingCart,
  CircleMinus,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import services from "../services/productServices";
import transactionServices from "../services/transactionServices";
import type { Product } from "../types";

type CartMap = Record<string, number>;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const resolveImageUrl = (product: Product) => {
  const imageSource =
    product.thumbnail || product.image_url || product.image || null;

  if (!imageSource) {
    return null;
  }

  if (
    imageSource.startsWith("http://") ||
    imageSource.startsWith("https://")
  ) {
    return imageSource;
  }

  try {
    return new URL(imageSource, import.meta.env.VITE_API_URL).toString();
  } catch {
    return imageSource;
  }
};

const TransactionCreatePage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartMap>({});
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Buat Transaksi | EStock";
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await services.getProducts();
      setProducts(response);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      toast.error("Gagal memuat produk");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const setProductQty = (product: Product, nextQty: number) => {
    const maxStock = Math.max(0, Number(product.stock) || 0);

    setCart((prev) => {
      const next = Math.max(0, Math.min(maxStock, nextQty));

      if (next === 0) {
        const { [product.uuid]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [product.uuid]: next };
    });
  };

  const updateQty = (product: Product, delta: number) => {
    const current = cart[product.uuid] || 0;
    setProductQty(product, current + delta);
  };

  const removeProduct = (product: Product) => {
    setProductQty(product, 0);
  };

  const filteredProducts = products.filter((product) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      product.product_title.toLowerCase().includes(keyword) ||
      product.product_sku.toLowerCase().includes(keyword)
    );
  });

  const selectedItems = products
    .filter((product) => (cart[product.uuid] || 0) > 0)
    .map((product) => {
      const quantity = cart[product.uuid];
      const price = Number(product.selling_price) || 0;
      const subtotal = quantity * price;

      return {
        product,
        quantity,
        price,
        subtotal,
      };
    });

  const totalQty = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const hasTransaction = totalQty > 0;

  useEffect(() => {
    if (!hasTransaction) {
      setExpanded(false);
    }
  }, [hasTransaction]);

  const handleSubmitTransaction = async () => {
    if (selectedItems.length === 0 || submitting) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        transaction: {
          discount_type: "nominal" as const,
          discount_amount: 0,
          payment_method: "cash",
        },
        items: selectedItems.map((item) => ({
          product_id: item.product.id,
          product_uuid: item.product.uuid,
          unit_price: item.price,
          qty: item.quantity,
          total: item.subtotal,
        })),
      };

      const response = await transactionServices.createTransaction(payload);
      const createdId = response.data?.transaction?.id;

      toast.success(response.message || "Transaksi berhasil disimpan");
      setCart({});
      setExpanded(false);

      if (createdId) {
        navigate(`/transaction/${createdId}`);
      } else {
        navigate("/transaction");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Gagal menyimpan transaksi");
      } else {
        toast.error("Gagal menyimpan transaksi");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="sm:flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Buat Transaksi</h1>
          <small>Pilih produk dan atur quantity untuk transaksi</small>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
          <ShoppingCart size={16} />
          <ChevronRight size={16} />
          <span>Transaksi Baru</span>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <label
          htmlFor="search-product"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Cari Produk
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="search-product"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari berdasarkan nama produk atau SKU..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      <div className="mt-5 pb-40">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Memuat data produk...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            {search.trim()
              ? "Produk tidak ditemukan untuk pencarian ini."
              : "Belum ada data produk."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const qty = cart[product.uuid] || 0;
              const price = Number(product.selling_price) || 0;
              const stock = Math.max(0, Number(product.stock) || 0);
              const imageUrl = resolveImageUrl(product);

              return (
                <div
                  key={product.uuid}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="min-h-40 w-full bg-slate-100 sm:w-[40%] sm:min-h-full sm:border-r sm:border-slate-200">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.product_title}
                          className="h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 text-slate-400">
                          <Package size={28} />
                        </div>
                      )}
                    </div>

                    <div className="w-full p-4 sm:w-[70%]">
                      <div className="flex h-full flex-col">
                        <div>
                          <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                            {product.product_title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            SKU: {product.product_sku}
                          </p>

                          <div className="mt-3 flex items-end justify-between gap-3">
                            <p className="text-sm font-bold text-red-500">
                              {formatCurrency(price)}
                            </p>
                            <p
                              className={`rounded-md px-2 py-1 text-xs font-medium ${
                                stock > 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              Stok: {stock}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => updateQty(product, -1)}
                            disabled={qty <= 0}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={stock}
                            step={1}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={qty}
                            onChange={(event) => {
                              const nextQty = Number.parseInt(
                                event.target.value,
                                10,
                              );

                              if (Number.isNaN(nextQty)) {
                                setProductQty(product, 0);
                                return;
                              }

                              setProductQty(product, nextQty);
                            }}
                            className="w-16 border-0 bg-transparent text-center text-sm font-semibold text-slate-800 outline-none [appearance:textfield] focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            aria-label={`Jumlah untuk ${product.product_title}`}
                          />
                          <button
                            type="button"
                            onClick={() => updateQty(product, 1)}
                            disabled={stock <= 0 || qty >= stock}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-red-500 text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 md:left-64 ${
          hasTransaction
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div
          className={`mx-4 mb-4 overflow-hidden rounded-2xl bg-red-500 text-white shadow-2xl transition-all duration-300 ${
            expanded ? "max-h-[80vh]" : "max-h-24 cursor-pointer"
          }`}
          onClick={() => {
            if (!expanded) {
              setExpanded(true);
            }
          }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-red-100">
                Total Belanja ({totalQty} item)
              </p>
              <p className="text-base font-bold sm:text-lg">
                {formatCurrency(totalPrice)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {expanded ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpanded(false);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/40 bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Tutup detail transaksi"
                >
                  <X size={16} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSubmitTransaction();
                }}
                disabled={submitting}
                className="rounded-lg cursor-pointer bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-70"
              >
                {submitting ? "Menyimpan..." : "Ke Pembayaran"}
              </button>
            </div>
          </div>

          {expanded ? (
            <div className="max-h-[60vh] space-y-3 overflow-auto border-t border-white/20 bg-red-600/40 px-4 py-4 sm:px-5">
              {selectedItems.map((item) => (
                <div
                  key={item.product.uuid}
                  className="rounded-xl border border-white/20 bg-white/10 p-3 hover:bg-red-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => removeProduct(item.product)}
                          className="cursor-pointer"
                          aria-label={`Hapus ${item.product.product_title} dari transaksi`}
                          title="Hapus produk"
                        >
                          <CircleMinus size={15} />
                        </button>
                        <p className="text-sm font-semibold text-white">
                          {item.product.product_title}
                        </p>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-red-100">
                        <p>Qty: {item.quantity}</p>
                        <p>Harga: {formatCurrency(item.price)}</p>
                        <p className="text-right font-semibold text-white">
                          Total: {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-white/30 bg-white/15 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-red-100">Total Quantity</span>
                  <span className="font-semibold text-white">{totalQty}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-red-100">Grand Total</span>
                  <span className="font-bold text-white">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TransactionCreatePage;
