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
    id: product.id,
    uuid: product.uuid,
    productSku: product.product_sku,
    productTitle: product.product_title,
    category: product.category,
    unit: product.unit,
    sellingPrice: Number(product.selling_price),
    stock,
    minimumStock,
    stockStatus: getStockStatus(stock, minimumStock),
  };
};

const mapAuditTrail = (trail) => ({
  id: trail.id,
  action: trail.action,
  initialStock: trail.initialStock,
  adjustment: trail.adjustment,
  finalStock: trail.finalStock,
  notes: trail.notes,
  createdAt: trail.createdAt,
  user: trail.user
    ? {
        id: trail.user.id,
        username: trail.user.username,
      }
    : null,
  supplier: trail.supplier
    ? {
        id: trail.supplier.id,
        suppliers_code: trail.supplier.suppliers_code,
        name: trail.supplier.name,
      }
    : null,
});

const parsePositiveInteger = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw buildServiceError(`${fieldName} must be a positive integer`, 400);
  }

  return parsed;
};

const parseOptionalPositiveInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return parsePositiveInteger(value, fieldName);
};

const getDateRangeFilter = ({ periodType, month, year }) => {
  const normalizedPeriodType = String(periodType || "monthly").toLowerCase();
  const yearValue = Number(year || new Date().getFullYear());

  if (!Number.isInteger(yearValue) || yearValue < 1970) {
    throw buildServiceError("year must be a valid year", 400);
  }

  if (normalizedPeriodType === "yearly") {
    return {
      gte: new Date(Date.UTC(yearValue, 0, 1)),
      lt: new Date(Date.UTC(yearValue + 1, 0, 1)),
    };
  }

  if (normalizedPeriodType !== "monthly") {
    throw buildServiceError("periodType must be monthly or yearly", 400);
  }

  const monthValue = Number(month || new Date().getMonth() + 1);

  if (!Number.isInteger(monthValue) || monthValue < 1 || monthValue > 12) {
    throw buildServiceError("month must be between 1 and 12", 400);
  }

  return {
    gte: new Date(Date.UTC(yearValue, monthValue - 1, 1)),
    lt: new Date(Date.UTC(yearValue, monthValue, 1)),
  };
};

const getProductByUuid = async (uuid) => {
  const productUuid = String(uuid || "").trim();

  if (!productUuid) {
    throw buildServiceError("product uuid is required", 400);
  }

  const product = await prisma.product.findUnique({
    where: { uuid: productUuid },
    select: {
      id: true,
      uuid: true,
      product_sku: true,
      product_title: true,
      category: true,
      unit: true,
      selling_price: true,
      stock: true,
      minimum_stock: true,
    },
  });

  if (!product) {
    throw buildServiceError("product not found", 404);
  }

  return product;
};

const stockManagementService = {
  getStockList: async () => {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        uuid: true,
        product_sku: true,
        product_title: true,
        category: true,
        unit: true,
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

  getStockDetail: async (uuid) => {
    const product = await getProductByUuid(uuid);
    return mapStockProduct(product);
  },

  getAuditTrails: async (uuid, filters = {}) => {
    const product = await getProductByUuid(uuid);
    const createdAt = getDateRangeFilter(filters);
    const supplierId = parseOptionalPositiveInteger(
      filters.supplierId,
      "supplierId",
    );
    const adjustmentType = String(filters.adjustmentType || "all").toLowerCase();

    const where = {
      productId: product.id,
      createdAt,
      ...(supplierId ? { supplierId } : {}),
    };

    if (adjustmentType === "increase") {
      where.adjustment = { gt: 0 };
    } else if (adjustmentType === "decrease") {
      where.adjustment = { lt: 0 };
    } else if (adjustmentType !== "all") {
      throw buildServiceError("adjustmentType must be all, increase, or decrease", 400);
    }

    const trails = await prisma.stockAuditTrail.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        supplier: {
          select: {
            id: true,
            suppliers_code: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return trails.map(mapAuditTrail);
  },

  adjustStock: async ({ uuid, userId, adjustmentType, action, adjustment, supplierId, notes }) => {
    const product = await getProductByUuid(uuid);
    const userValue = parsePositiveInteger(userId, "userId");
    const adjustmentValue = parsePositiveInteger(adjustment, "adjustment");
    const normalizedType = String(adjustmentType || "").toLowerCase();
    const normalizedAction = String(action || "").trim().toUpperCase();
    const normalizedNotes = String(notes || "").trim() || null;
    let supplierValue = parseOptionalPositiveInteger(supplierId, "supplierId");

    if (!["increase", "decrease"].includes(normalizedType)) {
      throw buildServiceError("adjustmentType must be increase or decrease", 400);
    }

    if (!normalizedAction) {
      throw buildServiceError("action is required", 400);
    }

    if (normalizedType === "increase" && !supplierValue) {
      throw buildServiceError("supplierId is required when stock increases", 400);
    }

    if (normalizedType === "decrease") {
      supplierValue = null;
    }

    if (supplierValue) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierValue },
        select: { id: true },
      });

      if (!supplier) {
        throw buildServiceError("supplier not found", 404);
      }
    }

    const signedAdjustment =
      normalizedType === "increase" ? adjustmentValue : -adjustmentValue;
    const initialStock = Number(product.stock);
    const finalStock = initialStock + signedAdjustment;

    if (finalStock < 0) {
      throw buildServiceError("final stock cannot be negative", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: product.id },
        data: {
          stock: finalStock,
        },
        select: {
          id: true,
          uuid: true,
          product_sku: true,
          product_title: true,
          category: true,
          unit: true,
          selling_price: true,
          stock: true,
          minimum_stock: true,
        },
      });

      const trail = await tx.stockAuditTrail.create({
        data: {
          productId: product.id,
          userId: userValue,
          supplierId: supplierValue,
          action: normalizedAction,
          initialStock,
          adjustment: signedAdjustment,
          finalStock,
          notes: normalizedNotes,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          supplier: {
            select: {
              id: true,
              suppliers_code: true,
              name: true,
            },
          },
        },
      });

      return {
        product: updated,
        trail,
      };
    });

    return {
      product: mapStockProduct(result.product),
      trail: mapAuditTrail(result.trail),
    };
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
        id: true,
        uuid: true,
        product_sku: true,
        product_title: true,
        category: true,
        unit: true,
        selling_price: true,
        stock: true,
        minimum_stock: true,
      },
    });

    return mapStockProduct(updated);
  },
};

export default stockManagementService;
