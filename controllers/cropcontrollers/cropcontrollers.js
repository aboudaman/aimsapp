"use strict"
/* Controller to set routes for each memberstate Information
 * This controller does not provide routes for production data
 * */

const mongoose = require("mongoose")
const MemberState = require("../../models/memberstates/MemberState")
const MemberStateModel = MemberState.MemberState

//Load Model to store livestock records
const LiveStock = require("../../models/livestocks/LiveStock")
const LiveStockModel = LiveStock.LiveStock

//Load Model to store Core Crops records
const Crops = require("../../models/crops/Crops")
const CropsModel = Crops.CoreCrops

//Load Model to store Livestock Production records
const LiveStockProduction = require("../../models/livestocks/LiveStockProduction")
const LiveStockProductionModel = LiveStockProduction.LiveStockProduction


//# Load class to resize image and the path module
const Resize = require("../../middlewares/Resize")
const path = require("path")
const multer = require("multer")

const getSubDocuments = ((fieldName, fieldValue, populateField, modelName) => {
  return modelName.findOne({ fieldName: fieldValue })
    .populate(populateField).exec((err, values) => {
      console.log(values);
    })
})
module.exports = {
	index: (req, res, next) => {
		MemberStateModel.find({})
			.then((memberstates) => {
				res.locals.memberstates = memberstates
				next()
				})
			.catch(error => {
				if (error) throw error
			})
			
	},
	indexView: (req, res) => {
		res.render("memberstate/index")

	},
	// ** STAY **
	getCropForm: async (req, res) => {
		try {
			const crops = await CropsModel.find({})
			const cropItems = [... new Set(crops.map(c => c.crop))]
								.sort()

			res.render("corecrop/addcrop", {crops: crops, cropsOrdered: cropItems})
		} catch (error) {
			req.flash("error", "There was an error ${error.message}")
			if (error) throw error.message
			
		}
		
	},
	saveCrop: async (req, res, next) => {
		let newCrop = new CropsModel({
			crop: req.body.coreCrop,
		})
		newCrop.save()
			.then(() => {
				req.flash("success", "Crop Added!!!")
				res.locals.redirect = "/crop/new"
				next()
			})
			.catch(error => {
				res.locals.redirect = "/crop/new"
				req.flash("error", `There was an error ${error.message}`)
				next()
			})
	},
	editCrop: async (req, res, next) => {
		try {
			let cropId = req.params.id
			const crop = await CropsModel.findById(cropId)
			res.render("corecrop/editcrop", {crop: crop})
			
		} catch (error) {
			req.flash("error", `There was an error ${error.message}`)
			req.locals.redirect = "/crop/new"
			next()
		}
	},
	update: async(req, res, next) => {
		try {
			let cropId = req.params.id
			let cropsParams = {
				crop: req.body.coreCrop
			}
			const updatedCrop = await CropsModel.findByIdAndUpdate(cropId, {$set: cropsParams})
			req.flash("success", "The Core Crop Database has been updated")
			res.locals.redirect = `/crop/new`
			next()
			
		} catch (error) {
			req.flash("error", `There was an error ${error.message}`)
			req.locals.redirect = "/crop/new"
			next()
		}
	},
	deleteCrop: async (req, res, next) => {
		try {
			let cropId = req.params.id
			const deleted = await CropsModel.findByIdAndRemove(cropId)
			req.flash("success", "The Crop Item Has been Deleted Successfully")
			res.locals.redirect = "/crop/new"
			next()

			
		} catch (error) {
			req.flash("error", `There was an error ${error.message}`)
			res.locals.redirect("/crop/new")
			next()
			
		}
	},
	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect
		if (redirectPath) res.redirect(redirectPath)
		else next()

	},

	showMemberState: async (req, res, next) => {
		try {
			let memberId = req.params.id
			const memberState = await MemberStateModel.findById({_id: memberId})

		//## Begin loading SubDocuments ##	
			const liveAnimalID = memberState.liveanimals
			const commentPromises = liveAnimalID.map(_id => {
			  return LiveStockProductionModel.findOne({ _id })
			})
			const liveAnimalsData = await Promise.all(commentPromises)
		//## END Loading Sub Documents ##

			const memberStateLive = await MemberStateModel.findOne({countryName: "Botswana"}).populate("name").exec()
			res.locals.liveAnimalsData = liveAnimalsData
			res.locals.memberState = memberState
			next()

		} catch(error) {
			
			if (error) throw error
			
		}
	},
	showMemberStateView: (req, res) => {
		res.render("memberstate/memberstate")
	},
	// Dashboard
	showDashboard: async (req, res, next) =>  {
		try {
			const memberState = await MemberStateModel.find({})

			// ## Begin Loading Sub Documents
				const liveAnimalID = memberState.liveanimals
				const commentPromises = liveAnimalID.map(_id => {
				return LiveStockProductionModel.findOne({ _id })
				})
				const liveAnimalsData = await Promise.all(commentPromises)
			// ## END Loading 
			const sadcMemberStates = [... new Set 
					(memberState.map (n => n.countryName))]
			
			// console.log(sadcMemberStates)
			sadcMemberStates.sort()
			// console.log(sadcMemberStates)

			res.locals.members = sadcMemberStates
			next()

		} catch(error) {
			req.flash("error", `There was an error: ${error.message}`)
			next()
		}
	
	},
		showDashboardView: (req, res) =>  {
			res.render("memberstate/dashboardmem")
	
		},
	chartApi: (req, res) => {
		MemberStateModel.find({})
			.then((memberstates) => {
				res.json({"members": memberstates})

			})
			.catch(error => {
				if (error) console.log(`There was an error showing the charts ${error.message}`)
				next()
			})

			}
}
