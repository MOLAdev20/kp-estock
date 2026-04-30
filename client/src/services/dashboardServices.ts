import api from "../api/axios";
import type { DashboardOverview } from "../types";

const dashboardServices = {
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get("/dashboard");
    return response.data.data;
  },
};

export default dashboardServices;
