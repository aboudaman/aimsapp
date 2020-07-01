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

//Load Model to store Indicator records
// const Indicator = require("../../models/indicators/Indicator")
// const IndicatorModel = Indicator.Indicator

//Load Model to store Crop Indicator records
const CropIndicator = require("../../models/indicators/CropIndicator")
const CropIndicatorModel = CropIndicator.CropIndicator

//Load Model to store Livestock Indicator records
const LivestockIndicator = require("../../models/indicators/LivestockIndicator")
const LivestockIndicatorModel = LivestockIndicator.LivestockIndicator

//Load Model to store Animal Production indicators
const AnimalProductionIndicator = require("../../models/indicators/AnimalProductIndicator")
const AnimalProductionIndicatorModel = AnimalProductionIndicator.AnimalProductionIndicator

//Load Model to store Livestock Production records
const LiveStockProduction = require("../../models/livestocks/LiveStockProduction")
const LiveStockProductionModel = LiveStockProduction.LiveStockProduction

//# Load class to resize image and the path module
const Resize = require("../../middlewares/Resize")
const path = require("path")
const multer = require("multer")

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
	getIndicatorForm: async (req, res) => {
		try {
			const cropIndicator = await CropIndicatorModel.find({})
			// const livestockIndicator = [{indicator: 'test'}]
			const livestockIndicator = await LivestockIndicatorModel.find()
			// LivestockIndicatorModel.find({}, function (err, docs) {
			// 	if (err) console.log('There is an error')
			// 	console.log(`length is ${docs.length}`)
			// 	livestockIndicator = docs
			// })
			const animalprodIndicator = await AnimalProductionIndicatorModel.find({})

			console.log(cropIndicator)
			console.log(livestockIndicator)


			// res.render("indicator/addindicator", {cropIndicators:cropIndicator})
			res.render("indicator/addindicator", {cropIndicators:cropIndicator, 
				livestockIndicators: livestockIndicator, animalprodIndicators:animalprodIndicator}) 

		} catch (error) {
			req.flash("error", "There was an error ${error.message}")
			if (error) throw error.message
		}
	},
	saveIndicator: async (req, res, next) => {
		let newCrop = new IndicatorModel({
			crop: req.body.coreCrop,
		})
		newIndicator.save()
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
	editIndicator: async (req, res, next) => {
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
	deleteIndicator: async (req, res, next) => {
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

	}


}
