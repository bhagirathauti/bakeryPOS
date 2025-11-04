const prisma = require('./prismaClient')
const bcrypt = require('bcrypt')

async function findUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    return user
  } catch (err) {
    console.error('findUserByEmail error', { email, err })
    throw err
  }
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } })
  if (!user) return null
  return { id: user.id, email: user.email, role: user.role }
}

async function createUser(email, password, role = 'shop_owner', shopId = null) {
  try {
    const existing = await findUserByEmail(email)
    if (existing) throw new Error('user_exists')
    const hash = await bcrypt.hash(password, 10)
    console.log('Creating user', { email, role, shopId })
    const userData = { email, password_hash: hash, role }
    if (shopId) {
      userData.shopId = shopId
    }
    const user = await prisma.user.create({ data: userData })
    console.log('User created', { id: user.id, email: user.email })
    return { id: user.id, email: user.email, role: user.role, shopId: user.shopId }
  } catch (err) {
    console.error('createUser error', { email, err })
    throw err
  }
}

async function verifyUser(email, password) {
  if (!email || !password) return null
  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { Shop: true, OwnerShop: true }
    })
    if (!user) return null
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return null
    
    // Determine shopId and shop details based on role
    let shopId = null
    let shopName = null
    
    if (user.role === 'shop_owner' && user.Shop) {
      shopId = user.Shop.id
      shopName = user.Shop.shopName
    } else if (user.role === 'cashier' && user.shopId && user.OwnerShop) {
      shopId = user.OwnerShop.id
      shopName = user.OwnerShop.shopName
    }
    
    return { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      shopId: shopId,
      shopName: shopName
    }
  } catch (err) {
    // Log unexpected errors (DB connectivity, unexpected Prisma errors)
    console.error('verifyUser error', err)
    // Rethrow so caller can decide how to respond (500 server error)
    throw err
  }
}

module.exports = { findUserByEmail, getUserById, createUser, verifyUser }
