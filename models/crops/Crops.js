/* Model to store Core Crops Items
    Used as CoreCropsModel
*/

const mongoose = require("mongoose")

const CropSchema = new mongoose.Schema({
    crop: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    }
})

module.exports = {
    CoreCrops: mongoose.model("CoreCrops", CropSchema)
}

