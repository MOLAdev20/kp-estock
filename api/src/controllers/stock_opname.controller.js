import stockOpnameService from "../services/stock_opname.service.js";

const stockOpnameController = {
  getRacks: async (_, res) => {
    try {
      const data = await stockOpnameService.getRacks();

      return res.status(200).json({
        success: true,
        message: "stock opname racks fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  getProductsByRack: async (req, res) => {
    try {
      const data = await stockOpnameService.getProductsByRack(req.query?.rack);

      return res.status(200).json({
        success: true,
        message: "stock opname products fetched successfully",
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
      const data = await stockOpnameService.getList();

      return res.status(200).json({
        success: true,
        message: "stock opnames fetched successfully",
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
      const data = await stockOpnameService.getDetail(req.params.id);

      return res.status(200).json({
        success: true,
        message: "stock opname fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  create: async (req, res) => {
    try {
      const data = await stockOpnameService.create({
        userId: req.user?.id,
        rack: req.body?.rack,
        items: req.body?.items,
      });

      return res.status(201).json({
        success: true,
        message: "stock opname created successfully",
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

export default stockOpnameController;
