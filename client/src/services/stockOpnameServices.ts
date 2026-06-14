import api from "../api/axios";
import type {
  CreateStockOpnamePayload,
  OpnameRackProduct,
  StockOpname,
} from "../types";

const stockOpnameServices = {
  getRacks: async (): Promise<string[]> => {
    const response = await api.get("/stock-opname/racks");
    return response.data.data;
  },

  getProductsByRack: async (rack: string): Promise<OpnameRackProduct[]> => {
    const response = await api.get("/stock-opname/products", {
      params: { rack },
    });
    return response.data.data;
  },

  getOpnames: async (): Promise<StockOpname[]> => {
    const response = await api.get("/stock-opname");
    return response.data.data;
  },

  getOpname: async (id: number | string): Promise<StockOpname> => {
    const response = await api.get(`/stock-opname/${id}`);
    return response.data.data;
  },

  createOpname: async (
    payload: CreateStockOpnamePayload,
  ): Promise<StockOpname> => {
    const response = await api.post("/stock-opname", payload);
    return response.data.data;
  },
};

export default stockOpnameServices;
