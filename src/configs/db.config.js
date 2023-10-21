import mongoose from 'mongoose'
//data imports
// import { dataOverallStat } from '../data/index.js'

// import OverallStat from '../models/OverallStat.js'

const connectDatabase = () => {
  console.log('Connecting to database')
  // Connecting to the database
  mongoose
    .connect(process.env.MONGO_CLOUD_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    .then(() => {
      // OverallStat.insertMany(dataOverallStat)
      console.log('Successfully connected to the database')
    })
    .catch((err) => {
      console.log(`Could not connect to the database. Exiting now...\n${err}`)
      process.exit()
    })
}

export default connectDatabase
