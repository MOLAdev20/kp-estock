import { isAxiosError } from "axios";
import {
  ChevronRight,
  Package,
  Search,
  ShoppingCart,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import services from "../services/productServices";
import type { Product } from "../types";

type CartMap = Record<string, number>;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const resolveImageUrl = (product: Product) =>
  product.image_url || product.image || null;

const TransactionPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartMap>({});
  const [expanded, setExpanded] = useState(false);

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

  const updateQty = (product: Product, delta: number) => {
    const maxStock = Math.max(0, Number(product.stock) || 0);

    setCart((prev) => {
      const current = prev[product.uuid] || 0;
      const next = Math.max(0, Math.min(maxStock, current + delta));

      if (next === 0) {
        const { [product.uuid]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [product.uuid]: next };
    });
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

  const handleSubmitTransaction = () => {
    toast.success("Data transaksi siap. Integrasi submit endpoint belum tersedia.");
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
          <span>Transaksi</span>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                  <div className="relative h-36 w-full bg-slate-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.product_title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                        <Package size={28} />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                      {product.product_title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      SKU: {product.product_sku}
                    </p>

                    <div className="mt-3 flex items-end justify-between">
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

                    <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => updateQty(product, -1)}
                        disabled={qty <= 0}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-semibold text-slate-800">
                        {qty}
                      </span>
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
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Submit
              </button>
            </div>
          </div>

          {expanded ? (
            <div className="max-h-[60vh] space-y-3 overflow-auto border-t border-white/20 bg-red-600/40 px-4 py-4 sm:px-5">
              {selectedItems.map((item) => (
                <div
                  key={item.product.uuid}
                  className="rounded-xl border border-white/20 bg-white/10 p-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {item.product.product_title}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-red-100">
                    <p>Qty: {item.quantity}</p>
                    <p>Harga: {formatCurrency(item.price)}</p>
                    <p className="text-right font-semibold text-white">
                      Total: {formatCurrency(item.subtotal)}
                    </p>
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

export default TransactionPage;
