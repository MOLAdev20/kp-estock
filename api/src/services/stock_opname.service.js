import { prisma } from "../lib/prisma.js";

const buildServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const generateOpnameCode = () => {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const random = Math.floor(Math.random() * 9000) + 1000;

  return `OPN-${stamp}-${random}`;
};

const parsePositiveInteger = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw buildServiceError(`${fieldName} must be a positive integer`, 400);
  }

  return parsed;
};

const mapRackProduct = (product) => ({
  id: product.id,
  uuid: product.uuid,
  productSku: product.product_sku,
  productTitle: product.product_title,
  category: product.category,
  unit: product.unit,
  rack: product.rack,
  systemStock: Number(product.stock),
});

const mapOpnameItem = (item) => ({
  id: item.id,
  productId: item.product_id,
  productSku: item.product?.product_sku ?? null,
  productTitle: item.product?.product_title ?? null,
  unit: item.product?.unit ?? null,
  systemStock: item.system_stock,
  physicalStock: item.physical_stock,
  variance: item.variance,
});

const mapOpname = (opname) => ({
  id: opname.id,
  opnameCode: opname.opname_code,
  notes: opname.notes,
  createdAt: opname.created_at,
  user: opname.user
    ? {
        id: opname.user.id,
        username: opname.user.username,
      }
    : null,
  totalItems: opname._count ? opname._count.items : undefined,
  items: opname.items ? opname.items.map(mapOpnameItem) : undefined,
});

const stockOpnameService = {
  getRacks: async () => {
    const rows = await prisma.product.findMany({
      where: {
        status: true,
      },
      distinct: ["rack"],
      select: {
        rack: true,
      },
      orderBy: {
        rack: "asc",
      },
    });

    return rows
      .map((row) => row.rack)
      .filter((rack) => typeof rack === "string" && rack.trim() !== "");
  },

  getProductsByRack: async (rack) => {
    const rackValue = String(rack || "").trim();

    if (!rackValue) {
      throw buildServiceError("rack is required", 400);
    }

    const products = await prisma.product.findMany({
      where: {
        rack: rackValue,
        status: true,
      },
      select: {
        id: true,
        uuid: true,
        product_sku: true,
        product_title: true,
        category: true,
        unit: true,
        rack: true,
        stock: true,
      },
      orderBy: {
        product_title: "asc",
      },
    });

    if (products.length === 0) {
      throw buildServiceError("no products found for the selected rack", 404);
    }

    return products.map(mapRackProduct);
  },

  getList: async () => {
    const opnames = await prisma.stockOpname.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return opnames.map(mapOpname);
  },

  getDetail: async (id) => {
    const opnameId = parsePositiveInteger(id, "id");

    const opname = await prisma.stockOpname.findUnique({
      where: { id: opnameId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                product_sku: true,
                product_title: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!opname) {
      throw buildServiceError("stock opname not found", 404);
    }

    return mapOpname(opname);
  },

  create: async ({ userId, rack, items }) => {
    const userValue = parsePositiveInteger(userId, "userId");
    const rackValue = String(rack || "").trim();

    if (!rackValue) {
      throw buildServiceError("rack is required", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw buildServiceError("opname items are required", 400);
    }

    const normalizedItems = items.map((item) => {
      const productId = parsePositiveInteger(item.product_id, "product_id");
      const physicalStock = Number(item.physical_stock);

      if (!Number.isInteger(physicalStock) || physicalStock < 0) {
        throw buildServiceError(
          "physical_stock must be a non-negative integer",
          400,
        );
      }

      return { productId, physicalStock };
    });

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];

    if (productIds.length !== normalizedItems.length) {
      throw buildServiceError("duplicate product in opname items", 400);
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        rack: rackValue,
        status: true,
      },
      select: {
        id: true,
        stock: true,
      },
    });

    if (products.length !== productIds.length) {
      throw buildServiceError(
        "some products are invalid or do not belong to the selected rack",
        400,
      );
    }

    const systemStockMap = new Map(
      products.map((product) => [product.id, Number(product.stock)]),
    );

    const opnameCode = generateOpnameCode();
    const notes = `Stock Opname Rak ${rackValue}`;

    const created = await prisma.$transaction(async (tx) => {
      const opname = await tx.stockOpname.create({
        data: {
          opname_code: opnameCode,
          notes,
          user_id: userValue,
        },
      });

      await tx.stockOpnameItem.createMany({
        data: normalizedItems.map((item) => {
          const systemStock = systemStockMap.get(item.productId);

          return {
            stock_opname_id: opname.id,
            product_id: item.productId,
            system_stock: systemStock,
            physical_stock: item.physicalStock,
            variance: item.physicalStock - systemStock,
          };
        }),
      });

      return opname;
    });

    return stockOpnameService.getDetail(created.id);
  },
};

export default stockOpnameService;
