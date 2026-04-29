import stockManagementService from "../services/stock_management.service.js";

const stockManagementController = {
  getAll: async (_, res) => {
    try {
      const data = await stockManagementService.getStockList();

      return res.status(200).json({
        success: true,
        message: "stock products fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  updateOne: async (req, res) => {
    try {
      const data = await stockManagementService.updateStock({
        uuid: req.params.uuid,
        stock: req.body?.stock,
      });

      return res.status(200).json({
        success: true,
        message: "product stock updated successfully",
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

export default stockManagementController;
