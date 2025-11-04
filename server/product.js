const prisma = require('./prismaClient')

async function addProduct(shopId, { productName, price, discount, cgst, sgst, stock }) {
  try {
    return await prisma.product.create({
      data: {
        shopId: Number(shopId),
        productName,
        price: Number(price),
        discount: Number(discount) || 0,
        cgst: Number(cgst) || 0,
        sgst: Number(sgst) || 0,
        stock: Number(stock) || 0,
      }
    })
  } catch (err) {
    console.error('Prisma addProduct error:', err);
    throw err;
  }
}

async function getProducts(shopId) {
  return await prisma.product.findMany({
    where: { shopId: Number(shopId) },
    orderBy: { createdAt: 'desc' }
  })
}

async function updateProduct(productId, data) {
  try {
    return await prisma.product.update({
      where: { id: Number(productId) },
      data
    })
  } catch (err) {
    console.error('Prisma updateProduct error:', err);
    throw err;
  }
}

async function deleteProduct(productId) {
  return await prisma.product.delete({
    where: { id: Number(productId) }
  })
}

module.exports = { addProduct, getProducts, updateProduct, deleteProduct }
