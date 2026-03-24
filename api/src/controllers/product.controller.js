import { prisma } from "../lib/prisma.js"
import productService from "../services/product.service.js"

const productController = {
    getAll : async (_, res) => {

        try{
            const product = await prisma.product.findMany()
            res.json({
                data: product
            })
        }catch(err){
            res.json({
                err
            })
        }
    },

    createOne: async (req, res) => {

        const data = {
            product_sku: req.body.product_sku,
            product_title: req.body.product_title,
            category: req.body.category,
            unit: req.body.unit,
            cost_price: Number(req.body.cost_price),
            selling_price: Number(req.body.selling_price),
            stock: Number(req.body.stock),
            minimum_stock: Number(req.body.minimum_stock),
            rack: req.body.rack,
            description: req.body.description
        }

        try{
            const insertedProduct = await productService.store(data)

            res.json({
                message: "Product created successfully",
                newProduct: insertedProduct
            })
        }catch(err){
            res.json({
                message: "Error creating product",
                err: err.message
            })
        }

    }
}

export default productController