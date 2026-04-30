import usersService from "../services/users.service.js";

const usersController = {
  getAll: async (_, res) => {
    try {
      const data = await usersService.getAllStaff();

      return res.status(200).json({
        success: true,
        message: "users fetched successfully",
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
      const data = await usersService.createStaff({
        username: req.body?.username,
        email: req.body?.email,
        password: req.body?.password,
        role: req.body?.role,
      });

      return res.status(201).json({
        success: true,
        message: "user created successfully",
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
      const data = await usersService.updateStaff(req.params.id, {
        username: req.body?.username,
        email: req.body?.email,
        role: req.body?.role,
      });

      return res.status(200).json({
        success: true,
        message: "user updated successfully",
        data,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      await usersService.changeStaffPassword(req.params.id, req.body?.password);

      return res.status(200).json({
        success: true,
        message: "password updated successfully",
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "internal server error",
      });
    }
  },
};

export default usersController;
