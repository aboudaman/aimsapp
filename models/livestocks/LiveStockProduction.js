/* Model to store the Number of livestocks per year.  
 * Used as LiveStockProductionModel
 * */
const mongoose = require("mongoose")

const MemberStateModel = require("../memberstates/MemberState")
const LivestockIndicatorModel = require("../indicators/LivestockIndicator")

//Create the Schema
const LiveStockProductionSchema = new mongoose.Schema({
	memberState: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'MemberStateModel'
	},
	livestock:{ 
		type: String,
		lowercase: true,
		required: true,
		trim: true 
	},
	quantity: {
		type: Number,
		required: true
	},
	indicator: String,
	females: String,
	birth_numbers: Number,
	number_of_loss_recorded: Number,
	number_slaughtered: Number,
	year: {
		type: Date,
		required: true
	},
	updated: { type: Date, default: Date.now() }
}) 

// Create a virtual property `domain` that's computed from `email`.
LiveStockProductionSchema.virtual('reportingYear').get(function() {
	const d = new Date()

	return this.year.getFullYear()
  });

//Export the Model
module.exports = mongoose.model('LiveStockProductionModel', LiveStockProductionSchema)
	

