import { prisma } from "../lib/prisma.js"

const productService = {
    store: async data => {
        return await prisma.product.create({
            data: data
        })
    }
}

export default productService