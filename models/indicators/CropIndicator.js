/* Model to store Crops Indicators
    Used as CropIndicatorModel
*/

const mongoose = require("mongoose")

const IndicatorSchema = new mongoose.Schema({
    indicator: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    }
})

module.exports = {
    CropIndicator: mongoose.model("CropIndicator", IndicatorSchema)
}

