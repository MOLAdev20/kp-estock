import api from "../api/axios";
import type { Supplier, SupplierPayload } from "../types";

const supplierServices = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get("/suppliers");
    return response.data.data;
  },

  getSupplierById: async (id: number): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data.data;
  },

  createSupplier: async (payload: SupplierPayload): Promise<Supplier> => {
    const response = await api.post("/suppliers", payload);
    return response.data.data;
  },

  updateSupplier: async (id: number, payload: SupplierPayload): Promise<Supplier> => {
    const response = await api.put(`/suppliers/${id}`, payload);
    return response.data.data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};

export default supplierServices;
