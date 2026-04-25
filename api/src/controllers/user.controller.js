import userService from "../services/user.service.js"

const userController = {
    login: async (req, res) => {
        const username = req.body?.username?.trim()
        const password = req.body?.password

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "username and password are required",
            })
        }

        try {
            const data = await userService.login({ username, password })

            return res.status(200).json({
                success: true,
                message: "login successfully",
                data,
            })
        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "internal server error",
            })
        }
    },

    refreshAccessToken: async (req, res) => {
        const { refreshToken } = req.body || {}

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "refreshToken is required",
            })
        }

        try {
            const data = await userService.refreshAccessToken(refreshToken)

            return res.status(200).json({
                success: true,
                message: "refresh token successfully",
                data,
            })
        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "internal server error",
            })
        }
    },

    logout: async (req, res) => {
        const { refreshToken } = req.body || {}

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "refreshToken is required",
            })
        }

        try {
            await userService.logout(refreshToken)

            return res.status(200).json({
                success: true,
                message: "logout successfully",
            })
        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "internal server error",
            })
        }
    },
}

export default userController
