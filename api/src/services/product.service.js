import { prisma } from "../lib/prisma.js"

const productService = {
    store: async param => {
        const inserted = await prisma.product.create({
            data: param
        })

        return inserted
    }
}

export default productService