/* Model to store Indicator for Animal Production
    Used as AnimalProductionIndicatorModel
*/

const mongoose = require("mongoose")

const AnimalProductionIndicatorSchema = new mongoose.Schema({
    indicator: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    }
})

module.exports = {
    AnimalProductionIndicator: mongoose.model("AnimalProductionIndicator", AnimalProductionIndicatorSchema)
}

