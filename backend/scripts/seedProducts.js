require('dotenv').config()
const connectDB = require('../config/db')
const Product = require('../models/ProductModel')

const seed = async () => {
  try {
    await connectDB()
    // sample products
    const samples = [
      {
        name: 'Classic White Tee',
        description: 'Comfortable 100% cotton white t-shirt',
        price: 19.99,
        category: 'Apparel',
        subCategory: 'T-Shirts',
        sizes: ['S','M','L','XL'],
        images: ['https://via.placeholder.com/600x600.png?text=White+Tee'],
        bestSeller: true,
      },
      {
        name: 'Blue Denim Jeans',
        description: 'Slim-fit blue denim jeans',
        price: 49.99,
        category: 'Apparel',
        subCategory: 'Jeans',
        sizes: ['30','32','34','36'],
        images: ['https://via.placeholder.com/600x600.png?text=Denim+Jeans'],
      },
      {
        name: 'Minimalist Backpack',
        description: 'Water-resistant backpack with laptop sleeve',
        price: 69.5,
        category: 'Accessories',
        subCategory: 'Bags',
        sizes: [],
        images: ['https://via.placeholder.com/600x600.png?text=Backpack'],
      }
    ]

    // insert without duplicating by name
    for (const p of samples) {
      const existing = await Product.findOne({ name: p.name })
      if (existing) {
        console.log('Skipping existing:', p.name)
        continue
      }
      const prod = await Product.create(p)
      console.log('Inserted product:', prod._id.toString(), prod.name)
    }

    console.log('Seeding complete')
    process.exit(0)
  } catch (err) {
    console.error('Seeder error', err)
    process.exit(1)
  }
}

seed()
