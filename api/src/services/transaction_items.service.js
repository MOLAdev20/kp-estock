const transactionItemsService = {
    createMany: async ({ tx, transactionId, items }) => {
        const payload = items.map(item => ({
            transaction_id: transactionId,
            product_id: item.product_id,
            unit_price: item.unit_price,
            qty: item.qty,
            total: item.total,
        }))

        return await tx.transactionItem.createMany({
            data: payload,
        })
    },
}

export default transactionItemsService
