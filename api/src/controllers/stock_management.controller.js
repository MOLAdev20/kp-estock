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

  getOne: async (req, res) => {
    try {
      const data = await stockManagementService.getStockDetail(req.params.uuid);

      return res.status(200).json({
        success: true,
        message: "stock product fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  getAuditTrails: async (req, res) => {
    try {
      const data = await stockManagementService.getAuditTrails(
        req.params.uuid,
        req.query,
      );

      return res.status(200).json({
        success: true,
        message: "stock audit trails fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  adjustStock: async (req, res) => {
    try {
      const data = await stockManagementService.adjustStock({
        uuid: req.params.uuid,
        userId: req.user?.id,
        adjustmentType: req.body?.adjustmentType,
        action: req.body?.action,
        adjustment: req.body?.adjustment,
        supplierId: req.body?.supplierId,
        notes: req.body?.notes,
      });

      return res.status(201).json({
        success: true,
        message: "product stock adjusted successfully",
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
