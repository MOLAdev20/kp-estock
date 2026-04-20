import api from "../api/axios";
import type { Product } from "../types"

const services = {
    getProducts: async (): Promise<Product[]> => {
        const response = await api.get("/product")
        return response.data.data
    },

    deleteProduct: async (uuid: string) => {
        await api.delete("/product/delete/" + uuid)
    },

    getProduct: async (id: string): Promise<Product[]> => {
        const response = await api.get("/product/"+id)
        return response.data.data
    }
}

export default services