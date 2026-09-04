require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const connectDB = require('../config/db')
const Product = require('../models/ProductModel')
const User = require('../models/UserModel')
const Order = require('../models/OrderModel')
const bcrypt = require('bcrypt')

const run = async () => {
  await connectDB()
  try {
    const sampleProducts = [
      {
        name: 'Basic Tee',
        description: 'Comfortable cotton tee',
        price: 19.99,
        category: 'Apparel',
        subCategory: 'Tops',
        sizes: ['S','M','L'],
        images: ['https://placehold.co/600x400?text=Basic+Tee']
      },
      {
        name: 'Blue Jeans',
        description: 'Classic denim jeans',
        price: 49.99,
        category: 'Apparel',
        subCategory: 'Bottoms',
        sizes: ['30','32','34'],
        images: ['https://placehold.co/600x400?text=Blue+Jeans']
      },
      {
        name: 'Sneakers',
        description: 'Everyday sneakers',
        price: 69.99,
        category: 'Footwear',
        subCategory: 'Shoes',
        sizes: ['8','9','10'],
        images: ['https://placehold.co/600x400?text=Sneakers']
      }
    ]

    const created = await Product.insertMany(sampleProducts)
    console.log('Inserted products:', created.map(p => ({ id: p._id, name: p.name })))

    // create or find test user
    let user = await User.findOne({ email: 'testuser@example.com' })
    if (!user) {
      const hashed = await bcrypt.hash('TestPass123', 10)
      user = await User.create({ name: 'Test User', email: 'testuser@example.com', password: hashed })
      console.log('Created test user:', user.email)
    } else {
      console.log('Found existing user:', user.email)
    }

    // create a sample COD order for the user using first product
    const first = created[0]
    const items = [
      { productId: first._id, name: first.name, image: first.images[0] || '', price: first.price, size: first.sizes[0] || '', quantity: 1 }
    ]
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0)

    const order = await Order.create({
      userId: user._id,
      items,
      amount: total,
      address: { firstName: 'Test', lastName: 'User', email: user.email, street: '123 Test St', city: 'City', state: 'State', zipcode: '00000', phone: '1234567890' },
      paymentMethod: 'COD',
      payment: false,
      status: 'Order Placed'
    })
    console.log('Created sample order:', order._id)

    console.log('Seeding complete')
  } catch (err) {
    console.error('Seeding error:', err)
  } finally {
    const mongoose = require('mongoose')
    await mongoose.disconnect()
    process.exit(0)
  }
}

run()
