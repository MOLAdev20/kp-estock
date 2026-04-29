import { prisma } from "../lib/prisma.js";

const buildServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getStockStatus = (stock, minimumStock) => {
  const normalizedStock = Number(stock);
  const normalizedMinimumStock = Math.max(Number(minimumStock) || 0, 0);
  const criticalThreshold = Math.max(Math.floor(normalizedMinimumStock / 2), 1);

  if (normalizedStock <= criticalThreshold) {
    return "critical";
  }

  if (normalizedStock <= normalizedMinimumStock) {
    return "low";
  }

  return "safe";
};

const mapStockProduct = (product) => {
  const stock = Number(product.stock);
  const minimumStock = Number(product.minimum_stock);

  return {
    uuid: product.uuid,
    productTitle: product.product_title,
    sellingPrice: Number(product.selling_price),
    stock,
    minimumStock,
    stockStatus: getStockStatus(stock, minimumStock),
  };
};

const stockManagementService = {
  getStockList: async () => {
    const products = await prisma.product.findMany({
      select: {
        uuid: true,
        product_title: true,
        selling_price: true,
        stock: true,
        minimum_stock: true,
      },
      orderBy: {
        product_title: "asc",
      },
    });

    return products.map(mapStockProduct);
  },

  updateStock: async ({ uuid, stock }) => {
    const productUuid = String(uuid || "").trim();
    const stockValue = Number(stock);

    if (!productUuid) {
      throw buildServiceError("product uuid is required", 400);
    }

    if (!Number.isInteger(stockValue) || stockValue < 0) {
      throw buildServiceError("stock must be a non-negative integer", 400);
    }

    const product = await prisma.product.findUnique({
      where: { uuid: productUuid },
      select: {
        uuid: true,
      },
    });

    if (!product) {
      throw buildServiceError("product not found", 404);
    }

    const updated = await prisma.product.update({
      where: { uuid: productUuid },
      data: {
        stock: stockValue,
      },
      select: {
        uuid: true,
        product_title: true,
        selling_price: true,
        stock: true,
        minimum_stock: true,
      },
    });

    return mapStockProduct(updated);
  },
};

export default stockManagementService;
