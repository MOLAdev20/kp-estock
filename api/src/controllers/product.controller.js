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
            res.status(500).json({
                message: "Error creating product",
                err: err.message
            })
        }

    },

    deleteOne: async(req, res) => {
        try{
            await prisma.product.delete({
                where: {
                    uuid: req.params.uuid
                }
            })

            res.json({
                message: "Product deleted successfully"
            })
        }catch(err){
            res.status(500).json({
                message: "Error deleting product",
                err: err.message
            })
        }
    },

    validateSku: async(req, res) => {
        try{
            const product = await prisma.product.findUnique({
                where: {
                    product_sku: req.params.sku
                }
            })

            if(product){
                res.status(409).json({
                    message: "Product SKU already exists"
                })
            }

            res.json({
                message: "Product SKU available"
            })

        }catch(err){
            console.log(err)
            res.status(500).json({
                message: "Error validating SKU",
                err: err.message
            })
        }
    },

    getById: async (req, res) => {

        const {id} = req.params

        try{
            const product = await prisma.product.findFirstOrThrow({
                id
            })
            res.json({
                data: product
            })
        }catch(err){
            res.status(500).json({
                err: err.message
            })
        }
    }
}

export default productController