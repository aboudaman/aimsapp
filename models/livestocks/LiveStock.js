/* Model to store the the type of livestocks in the database 
 * Used as LiveStockModel
 * */

const mongoose = require("mongoose")

const MemberState = require("../memberstates/MemberState")
const MemberStateModel = MemberState.MemberState
//Create the Schema
const LiveStockSchema = new mongoose.Schema({
	name:{ 
		type: String,
		unique: true,
		lowercase: true
	}
})

//Export the Model
module.exports = {
	LiveStock: mongoose.model("LiveStock", LiveStockSchema)
	
}
