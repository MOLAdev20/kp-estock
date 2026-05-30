import env from "../config/env.js"
import userService from "../services/user.service.js"
import {
    clearRefreshTokenCookie,
    getRefreshTokenFromRequest,
    setRefreshTokenCookie,
} from "../utils/auth-cookie.js"

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
            setRefreshTokenCookie(res, data.refreshToken, env.AUTH.JWT_REFRESH_EXPIRES_IN)

            return res.status(200).json({
                success: true,
                message: "login successfully",
                data: {
                    user: data.user,
                    accessToken: data.accessToken,
                },
            })
        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "internal server error",
            })
        }
    },

    refreshAccessToken: async (req, res) => {
        const refreshToken = getRefreshTokenFromRequest(req)

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "refresh token is required",
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
        const refreshToken = getRefreshTokenFromRequest(req)

        try {
            if (refreshToken) {
                await userService.logout(refreshToken)
            }

            clearRefreshTokenCookie(res, env.AUTH.JWT_REFRESH_EXPIRES_IN)

            return res.status(200).json({
                success: true,
                message: "logout successfully",
            })
        } catch (err) {
            clearRefreshTokenCookie(res, env.AUTH.JWT_REFRESH_EXPIRES_IN)

            return res.status(200).json({
                success: true,
                message: "logout successfully",
            })
        }
    },
}

export default userController
