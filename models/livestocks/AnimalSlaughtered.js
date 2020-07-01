/*	Model to store the number of animals slaughtered over a period of time
 */

const mongoose = require("mongoose")

const MemberState = require("../memberstates/MemberState")
const MemberStateModel = MemberState.MemberState
//Create the Schema
const AnimalSlaughteredSchema = new mongoose.Schema({
	name:{ 
		type: String,
		lowercase: true
	},
	value: Number,
	year: Number

})

//Export the Model
module.exports = {
	AnimalSlaughtered: mongoose.model("AnimalSlaughtered", AnimalSlaughteredSchema)
	
}
