import dashboardService from "../services/dashboard.service.js";

const dashboardController = {
  getOverview: async (_, res) => {
    try {
      const data = await dashboardService.getDashboardMetrics();

      return res.status(200).json({
        success: true,
        message: "dashboard fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },
};

export default dashboardController;
