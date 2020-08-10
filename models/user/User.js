const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
const passportLocalMongoose = require("passport-local-mongoose")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        lowercase: true
    }
})

userSchema.methods.getInfo = function() {
    return `Email: ${this.email}`
}
userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
  })
//Export the Model
module.exports = {
    User: mongoose.model('UserModel', userSchema)
}
