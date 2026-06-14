import api from "../api/axios";
import type {
  StockAdjustmentPayload,
  StockAdjustmentResult,
  StockAuditTrail,
  StockAuditTrailFilters,
  StockManagementProduct,
} from "../types";

type UpdateStockPayload = {
  stock: number;
};

const stockManagementServices = {
  getStockProducts: async (): Promise<StockManagementProduct[]> => {
    const response = await api.get("/stock-management");
    return response.data.data;
  },

  getStockProduct: async (uuid: string): Promise<StockManagementProduct> => {
    const response = await api.get(`/stock-management/${uuid}`);
    return response.data.data;
  },

  getAuditTrails: async (
    uuid: string,
    filters: StockAuditTrailFilters,
  ): Promise<StockAuditTrail[]> => {
    const response = await api.get(`/stock-management/${uuid}/audit-trails`, {
      params: filters,
    });
    return response.data.data;
  },

  adjustProductStock: async (
    uuid: string,
    payload: StockAdjustmentPayload,
  ): Promise<StockAdjustmentResult> => {
    const response = await api.post(
      `/stock-management/${uuid}/adjustments`,
      payload,
    );
    return response.data.data;
  },

  updateProductStock: async (
    uuid: string,
    payload: UpdateStockPayload,
  ): Promise<StockManagementProduct> => {
    const response = await api.patch("/stock-management/" + uuid, payload);
    return response.data.data;
  },
};

export default stockManagementServices;
