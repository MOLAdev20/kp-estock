import { prisma } from "../lib/prisma.js";
import transactionItemsService from "./transaction_items.service.js";

const ALLOWED_DISCOUNT_TYPES = ["percent", "nominal"];

const buildServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const generateTransactionCode = () => {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const random = Math.floor(Math.random() * 9000) + 1000;

  return `TRX-${stamp}-${random}`;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const normalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw buildServiceError("transaction items are required", 400);
  }

  return items.map((item) => {
    const qty = Number(item.qty);

    if (!Number.isInteger(qty) || qty <= 0) {
      throw buildServiceError("invalid item quantity", 400);
    }

    const productId = item.product_id ? Number(item.product_id) : null;
    const productUuid = item.product_uuid
      ? String(item.product_uuid).trim()
      : null;

    if (!productId && !productUuid) {
      throw buildServiceError("product identity is required", 400);
    }

    return {
      product_id: productId,
      product_uuid: productUuid,
      qty,
    };
  });
};

const normalizeDiscountType = (discountType) => {
  const normalized = String(discountType || "nominal")
    .trim()
    .toLowerCase();

  if (!ALLOWED_DISCOUNT_TYPES.includes(normalized)) {
    throw buildServiceError("invalid discount_type", 400);
  }

  return normalized;
};

const transactionService = {
  create: async ({ userId, transaction, items }) => {
    if (!userId) {
      throw buildServiceError("unauthorized", 401);
    }

    const normalizedItems = normalizeItems(items);
    const discountType = normalizeDiscountType(transaction?.discount_type);
    const discountAmount = toNumber(transaction?.discount_amount ?? 0);
    const paymentMethod = String(transaction?.payment_method || "cash").trim();

    if (!paymentMethod) {
      throw buildServiceError("payment_method is required", 400);
    }

    if (!Number.isFinite(discountAmount) || discountAmount < 0) {
      throw buildServiceError("invalid discount_amount", 400);
    }

    const productIds = normalizedItems
      .map((item) => item.product_id)
      .filter(Boolean);

    const productUuids = normalizedItems
      .map((item) => item.product_uuid)
      .filter(Boolean);

    const [productsById, productsByUuid] = await Promise.all([
      productIds.length
        ? prisma.product.findMany({
            where: { id: { in: productIds } },
          })
        : Promise.resolve([]),
      productUuids.length
        ? prisma.product.findMany({
            where: { uuid: { in: productUuids } },
          })
        : Promise.resolve([]),
    ]);

    const mapById = new Map(
      productsById.map((product) => [product.id, product]),
    );
    const mapByUuid = new Map(
      productsByUuid.map((product) => [product.uuid, product]),
    );

    const preparedItems = normalizedItems.map((item) => {
      const product = item.product_id
        ? mapById.get(item.product_id)
        : mapByUuid.get(item.product_uuid);

      if (!product) {
        throw buildServiceError("product not found", 404);
      }

      const unitPrice = Number(product.selling_price);
      const total = unitPrice * item.qty;

      return {
        product_id: product.id,
        unit_price: unitPrice,
        qty: item.qty,
        total,
      };
    });

    const totalPrice = preparedItems.reduce((sum, item) => sum + item.total, 0);
    const discountValue =
      discountType === "percent"
        ? (totalPrice * discountAmount) / 100
        : discountAmount;
    const grandTotal = Math.max(totalPrice - discountValue, 0);
    const transactionCode =
      String(transaction?.transaction_code || "").trim() ||
      generateTransactionCode();

    try {
      return await prisma.$transaction(async (tx) => {
        const createdTransaction = await tx.transaction.create({
          data: {
            user_id: userId,
            transaction_code: transactionCode,
            total_price: totalPrice,
            discount_type: discountType,
            discount_amount: discountAmount,
            grand_total: grandTotal,
            payment_method: paymentMethod,
          },
        });

        await transactionItemsService.createMany({
          tx,
          transactionId: createdTransaction.id,
          items: preparedItems,
        });

        for (const item of preparedItems) {
          const updatedStock = await tx.product.updateMany({
            where: {
              id: item.product_id,
              stock: {
                gte: item.qty,
              },
            },
            data: {
              stock: {
                decrement: item.qty,
              },
            },
          });

          if (updatedStock.count === 0) {
            throw buildServiceError("insufficient product stock", 400);
          }
        }

        const transactionSummary = await tx.transaction.findUnique({
          where: {
            id: createdTransaction.id,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                role: true,
              },
            },
            transaction_items: {
              include: {
                product: {
                  select: {
                    id: true,
                    uuid: true,
                    product_sku: true,
                    product_title: true,
                    unit: true,
                  },
                },
              },
            },
          },
        });

        return {
          transaction: transactionSummary,
        };
      });
    } catch (err) {
      if (err?.code === "P2002") {
        throw buildServiceError("transaction code already exists", 409);
      }

      throw err;
    }
  },

  getAll: async () => {
    return await prisma.transaction.findMany({
      orderBy: {
        created_at: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        transaction_items: {
          select: {
            id: true,
            qty: true,
            total: true,
          },
        },
      },
    });
  },

  getById: async id => {
    const transactionId = Number(id);

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      throw buildServiceError("invalid transaction id", 400);
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        transaction_items: {
          include: {
            product: {
              select: {
                id: true,
                uuid: true,
                product_sku: true,
                product_title: true,
                unit: true,
                selling_price: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw buildServiceError("transaction not found", 404);
    }

    return transaction;
  },
};

export default transactionService;
