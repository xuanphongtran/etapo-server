import mongoose from 'mongoose'
//data imports
// import {
//   dataUser,
//   dataProduct,
//   dataProductStat,
//   dataOrder,
//   dataOverallStat,
//   dataAffiliateStat,
// } from '../data/index.js'
// import User from '../models/User.js'
// import Product from '../models/Product.js'
// import ProductStat from '../models/ProductStat.js'
// import Order from '../models/Order.js'
// import OverallStat from '../models/OverallStat.js'
// import AffiliateStat from '../models/AffiliateStat.js'

const connectDatabase = () => {
  console.log('Connecting to database')
  // Connecting to the database
  mongoose
    .connect(process.env.MONGO_CLOUD_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    .then(() => {
      //only add data one time
      // User.insertMany(dataUser)
      // Product.insertMany(dataProduct)
      // ProductStat.insertMany(dataProductStat)
      // Order.insertMany(dataOrder)
      // OverallStat.insertMany(dataOverallStat)
      // AffiliateStat.insertMany(dataAffiliateStat)
      console.log('Successfully connected to the database')
    })
    .catch((err) => {
      console.log(`Could not connect to the database. Exiting now...\n${err}`)
      process.exit()
    })
}

export default connectDatabase
