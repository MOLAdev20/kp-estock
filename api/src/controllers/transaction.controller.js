import transactionService from "../services/transaction.service.js";

const transactionController = {
  create: async (req, res) => {
    const userId = req.user?.id;
    const transaction = req.body?.transaction || {};
    const items = req.body?.items || [];

    try {
      const data = await transactionService.create({
        userId,
        transaction,
        items,
      });

      return res.status(201).json({
        success: true,
        message: "transaction created successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  getAll: async (_, res) => {
    try {
      const data = await transactionService.getAll();

      return res.status(200).json({
        success: true,
        message: "transactions fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await transactionService.getById(req.params.id);

      return res.status(200).json({
        success: true,
        message: "transaction fetched successfully",
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

export default transactionController;
