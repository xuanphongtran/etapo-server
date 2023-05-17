import mongoose from 'mongoose'

const connectDatabase = () => {
    const mongoDbUrl = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`
    console.log(`Connecting to ${mongoDbUrl}`)
    // Connecting to the database
    mongoose
        .connect(mongoDbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

    // .connect('mongodb+srv://phongbvb:Adud3lWqHw6Cy3qD@potaxu01.ypzigil.mongodb.net/?retryWrites=true&w=majority',
    //     {
    //         useNewUrlParser: true,
    //         useUnifiedTopology: true,
    //     })
        .then(() => {
            console.log('Successfully connected to the database')
        })
        .catch((err) => {
            console.log(`Could not connect to the database. Exiting now...\n${err}`)
            process.exit()
        })
}

export default connectDatabase
