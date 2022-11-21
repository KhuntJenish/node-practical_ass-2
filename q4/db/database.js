var mongoose = require('mongoose');

//database config
const server = "127.0.0.1:27017"
const Database = "studentDB"

class database {
    constructor() {
        this._connect()
    }
    async _connect() {
        try {
            await mongoose.connect(`mongodb://${server}/${Database}`)
            console.log(`database connection successfull`)
        } catch (error) {
            console.error('Database connection error: ' + error);
        }
    }
}

module.exports = new database()