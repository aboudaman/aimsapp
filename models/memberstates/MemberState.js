/*MAIN Country Information Indicator*/

const mongoose = require("mongoose")

const LiveStockProductionModel = require("../livestocks/LiveStockProduction")


//Create the Schema
const memberStateSchema = new mongoose.Schema({
	countryName: { 
		type: String,
		lowercase: true,
		required: true,
		trim: true 
	},
	population: Number,
	currency: String,
	area: Number,
	livestocks:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'LivestockProductionModel'
	}],
	flag: String,
	gdp: String,
	flagUrl: String

})



//Export the Model
module.exports = mongoose.model('MemberStateModel', memberStateSchema)
