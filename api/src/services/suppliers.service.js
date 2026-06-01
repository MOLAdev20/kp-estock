import { prisma } from "../lib/prisma.js";

const buildServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const parseSupplierId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw buildServiceError("invalid supplier id", 400);
  }

  return id;
};

const sanitizeSupplier = (supplier) => ({
  id: supplier.id,
  suppliers_code: supplier.suppliers_code,
  name: supplier.name,
  pic: supplier.pic,
  phone: supplier.phone,
  email: supplier.email,
  address: supplier.address,
  moq: supplier.moq,
  bankName: supplier.bankName,
  bankAccount: supplier.bankAccount,
  createdAt: supplier.createdAt,
  updatedAt: supplier.updatedAt,
});

const normalizeNullableString = (value) => {
  const normalized = String(value || "").trim();
  return normalized || null;
};

const normalizeSupplierPayload = (payload = {}) => {
  const moqNumber = Number(payload.moq ?? 0);

  if (!Number.isInteger(moqNumber) || moqNumber < 0) {
    throw buildServiceError("moq must be a non-negative integer", 400);
  }

  return {
    suppliers_code: String(payload.suppliers_code || "").trim().toUpperCase(),
    name: String(payload.name || "").trim(),
    pic: normalizeNullableString(payload.pic),
    phone: String(payload.phone || "").trim(),
    email: normalizeNullableString(payload.email)?.toLowerCase() || null,
    address: String(payload.address || "").trim(),
    moq: moqNumber,
    bankName: normalizeNullableString(payload.bankName),
    bankAccount: normalizeNullableString(payload.bankAccount),
  };
};

const validateSupplierPayload = (payload) => {
  if (!payload.suppliers_code) {
    throw buildServiceError("supplier code is required", 400);
  }

  if (!payload.name) {
    throw buildServiceError("supplier name is required", 400);
  }

  if (!payload.phone) {
    throw buildServiceError("supplier phone is required", 400);
  }

  if (!payload.address) {
    throw buildServiceError("supplier address is required", 400);
  }
};

const suppliersService = {
  getAll: async () => {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return suppliers.map(sanitizeSupplier);
  },

  getById: async (id) => {
    const supplierId = parseSupplierId(id);
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw buildServiceError("supplier not found", 404);
    }

    return sanitizeSupplier(supplier);
  },

  createOne: async (payload) => {
    const normalized = normalizeSupplierPayload(payload);
    validateSupplierPayload(normalized);

    const duplicate = await prisma.supplier.findFirst({
      where: {
        OR: [
          { suppliers_code: normalized.suppliers_code },
          ...(normalized.email ? [{ email: normalized.email }] : []),
        ],
      },
    });

    if (duplicate) {
      throw buildServiceError("supplier code or email already exists", 409);
    }

    const created = await prisma.supplier.create({
      data: normalized,
    });

    return sanitizeSupplier(created);
  },

  updateOne: async (id, payload) => {
    const supplierId = parseSupplierId(id);
    const normalized = normalizeSupplierPayload(payload);
    validateSupplierPayload(normalized);

    const existing = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    if (!existing) {
      throw buildServiceError("supplier not found", 404);
    }

    const duplicate = await prisma.supplier.findFirst({
      where: {
        id: {
          not: supplierId,
        },
        OR: [
          { suppliers_code: normalized.suppliers_code },
          ...(normalized.email ? [{ email: normalized.email }] : []),
        ],
      },
    });

    if (duplicate) {
      throw buildServiceError("supplier code or email already exists", 409);
    }

    const updated = await prisma.supplier.update({
      where: { id: supplierId },
      data: normalized,
    });

    return sanitizeSupplier(updated);
  },

  deleteOne: async (id) => {
    const supplierId = parseSupplierId(id);

    const existing = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    if (!existing) {
      throw buildServiceError("supplier not found", 404);
    }

    await prisma.supplier.delete({
      where: { id: supplierId },
    });

    return null;
  },
};

export default suppliersService;
