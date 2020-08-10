const mongoose = require('mongoose')


const subscriberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    }
})

subscriberSchema.methods.getInfo = function() {
    return `Name: ${this.name} Email: ${this.email}`
}

//Export the Model
module.exports = mongoose.model('SubscriberModel', subscriberSchema)