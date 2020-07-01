/* Model to store Indicators
    Used as LivestockIndicatorModel
*/

const MemberStateModel = require("../memberstates/MemberState")
const LiveStockProductionModel = require("../livestocks/LiveStockProduction")

const mongoose = require("mongoose")

const LivestockIndicatorSchema = new mongoose.Schema({
    indicator: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    }
})

module.exports = {
    LivestockIndicator: mongoose.model("LivestockIndicator", LivestockIndicatorSchema)
}

