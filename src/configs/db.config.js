import mongoose from 'mongoose'
//data imports
// import { dataUser, dataProduct, dataProductStat, dataTransaction } from '../data/index.js'
// import User from '../models/User.js'
// import Product from '../models/Product.js'
// import ProductStat from '../models/ProductStat.js'
// import Transaction from '../models/Transaction.js'

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
      // Transaction.insertMany(dataTransaction)
      console.log('Successfully connected to the database')
    })
    .catch((err) => {
      console.log(`Could not connect to the database. Exiting now...\n${err}`)
      process.exit()
    })
}

export default connectDatabase
