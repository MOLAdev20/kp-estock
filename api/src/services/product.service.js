import { prisma } from "../lib/prisma.js"
import path from "path"
import { fileURLToPath } from "url"
import { promises as fs } from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsRootDirectory = path.resolve(__dirname, "../../uploads")

const removeLocalThumbnail = async thumbnailPath => {
    if (!thumbnailPath || !thumbnailPath.startsWith("/uploads/")) {
        return
    }

    const relativePath = thumbnailPath.replace("/uploads/", "")
    const absolutePath = path.resolve(uploadsRootDirectory, relativePath)

    if (!absolutePath.startsWith(uploadsRootDirectory)) {
        return
    }

    try {
        await fs.unlink(absolutePath)
    } catch (_) {
        return
    }
}

const productService = {
    store: async data => {
        return await prisma.product.create({
            data: data
        })
    },

    updateThumbnail: async (uuid, thumbnailPath) => {
        const product = await prisma.product.findUnique({
            where: { uuid }
        })

        if (!product) {
            const err = new Error("Product not found")
            err.statusCode = 404
            throw err
        }

        const updatedProduct = await prisma.product.update({
            where: { uuid },
            data: {
                thumbnail: thumbnailPath
            }
        })

        if (product.thumbnail && product.thumbnail !== thumbnailPath) {
            await removeLocalThumbnail(product.thumbnail)
        }

        return updatedProduct
    }
}

export default productService
