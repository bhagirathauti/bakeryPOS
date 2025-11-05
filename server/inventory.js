const prisma = require('./prismaClient')

async function addInventory(productId, { delta, reason, userId }) {
  // delta can be positive (add stock) or negative (remove stock)
  // We perform an atomic transaction: update the product stock using increment, then create a log entry
  try {
    const parsedDelta = Number(delta) || 0
    if (!parsedDelta) {
      throw new Error('invalid_delta')
    }
    // Some dev environments may not have the new InventoryLog Prisma model applied yet.
    // Detect if the Prisma client exposes inventoryLog; if not, perform the stock update
    // without creating a log so the operation still succeeds (useful during local dev).
    const hasInventoryLog = typeof prisma.inventoryLog !== 'undefined'

    const result = await prisma.$transaction(async (tx) => {
      // Update product stock using increment for atomicity
      const updatedProduct = await tx.product.update({
        where: { id: Number(productId) },
        data: {
          stock: { increment: parsedDelta }
        }
      })

      if (hasInventoryLog && tx.inventoryLog) {
        // Create inventory log with resulting stock
        const log = await tx.inventoryLog.create({
          data: {
            productId: Number(productId),
            delta: parsedDelta,
            resultingStock: updatedProduct.stock,
            reason: reason || null,
            userId: userId ? Number(userId) : null
          }
        })
        return { updatedProduct, log }
      }

      // If InventoryLog model isn't available, return updated product and null log
      console.warn('InventoryLog model not available on Prisma client; inventory change applied without log. Run `npx prisma db push` and `npx prisma generate` to enable logging.')
      return { updatedProduct, log: null }
    })

    return result
  } catch (err) {
    console.error('addInventory error', err)
    throw err
  }
}

async function getInventoryHistory(productId, { limit = 100 } = {}) {
  try {
    const logs = await prisma.inventoryLog.findMany({
      where: { productId: Number(productId) },
      orderBy: { createdAt: 'asc' },
      take: Number(limit)
    })
    return logs.map(l => ({ date: l.createdAt.toISOString(), stock: l.resultingStock, delta: l.delta, reason: l.reason }))
  } catch (err) {
    console.error('getInventoryHistory error - returning empty history:', err)
    return []
  }
}

module.exports = { addInventory, getInventoryHistory }
