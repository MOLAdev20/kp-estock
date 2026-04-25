import { jwtVerify } from "jose"
import env from "../config/env.js"

const encoder = new TextEncoder()
const ACCESS_SECRET = encoder.encode(env.AUTH.JWT_ACCESS_SECRET || "dev-access-secret")

const unauthorized = res => {
    return res.status(401).json({
        success: false,
        message: "unauthorized",
    })
}

const authorization = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return unauthorized(res)
    }

    const token = authHeader.replace("Bearer ", "").trim()

    if (!token) {
        return unauthorized(res)
    }

    try {
        const verified = await jwtVerify(token, ACCESS_SECRET, {
            algorithms: ["HS256"],
        })

        const payload = verified.payload

        if (payload.type !== "access" || !payload.sub) {
            return unauthorized(res)
        }

        req.user = {
            id: Number(payload.sub),
            username: payload.username,
            role: payload.role,
        }

        return next()
    } catch {
        return unauthorized(res)
    }
}

export default authorization
