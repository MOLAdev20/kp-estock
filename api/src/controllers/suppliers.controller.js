import suppliersService from "../services/suppliers.service.js";

const suppliersController = {
  getAll: async (_, res) => {
    try {
      const data = await suppliersService.getAll();

      return res.status(200).json({
        success: true,
        message: "suppliers fetched successfully",
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
      const data = await suppliersService.getById(req.params.id);

      return res.status(200).json({
        success: true,
        message: "supplier fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  createOne: async (req, res) => {
    try {
      const data = await suppliersService.createOne(req.body);

      return res.status(201).json({
        success: true,
        message: "supplier created successfully",
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
      const data = await suppliersService.updateOne(req.params.id, req.body);

      return res.status(200).json({
        success: true,
        message: "supplier updated successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  deleteOne: async (req, res) => {
    try {
      await suppliersService.deleteOne(req.params.id);

      return res.status(200).json({
        success: true,
        message: "supplier deleted successfully",
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },
};

export default suppliersController;
