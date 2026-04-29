import api from "../api/axios";
import type { StockManagementProduct } from "../types";

type UpdateStockPayload = {
  stock: number;
};

const stockManagementServices = {
  getStockProducts: async (): Promise<StockManagementProduct[]> => {
    const response = await api.get("/stock-management");
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
