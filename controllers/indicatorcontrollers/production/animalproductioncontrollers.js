"use strict"
/* Controller to set routes for each memberstate Information
 * This controller does not provide routes for production data
 * */
const mongoose = require("mongoose")
const MemberState = require("../../../models/memberstates/MemberState")
const MemberStateModel = MemberState.MemberState

//Load Model to store livestock records
// const LiveStock = require("../../../models/livestocks/LiveStock")
// const LiveStockModel = LiveStock.LiveStock

//Load Model to store Core Crops records
// const Crops = require("../../../models/crops/Crops")
// const CropsModel = Crops.CoreCrops

//Load Model to store Indicator records
// const CropIndicator = require("../../../models/indicators/CropIndicator")
// const CropIndicatorModel = CropIndicator.CropIndicator

//Load Model to store Indicator records
// const LivestockIndicator = require("../../../models/indicators/LivestockIndicator")
// const LivestockIndicatorModel = LivestockIndicator.LivestockIndicator

//Load Model to store Livestock Production records
// const LiveStockProduction = require("../../../models/livestocks/LiveStockProduction")
// const LiveStockProductionModel = LiveStockProduction.LiveStockProduction

//Load Model to store Animal Production indicators
const AnimalProductionIndicator = require("../../../models/indicators/AnimalProductIndicator")
const AnimalProductionIndicatorModel = AnimalProductionIndicator.AnimalProductionIndicator

//# Load class to resize image and the path module
const Resize = require("../../../middlewares/Resize")
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
	saveIndicator: async (req, res, next) => { 
		console.log(req.body.animalProd)
		let newIndicator = new AnimalProductionIndicatorModel({
			indicator: req.body.animalProd
		})
		newIndicator.save()
			.then(() => {
				req.flash("success", "Indicator Added!!!")
				res.locals.redirect = "/indicator/new"
				next()
			})
			.catch(error => {
				res.locals.redirect = "/indicator/new"
				req.flash("error", `There was an error ${error.message}`)
				next()
			})
	},
	editIndicator: async (req, res, next) => {
		try {
			let indicatorId = req.params.id
			const indicator = await LivestockIndicatorModel.findById(indicatorId)
			res.render("indicator/editanimalprodindicator", {indicator: indicator})
			
		} catch (error) {
			req.flash("error", `There was an error ${error.message}`)
			req.locals.redirect = "/indicator/new"
			next()
		}
	},
	update: async(req, res, next) => {
		try {
			let indicatorId = req.params.id
			let indicatorParams = {
				indicator: req.body.animalprodIndicator
			}
			const updatedIndicator = await LivestockIndicatorModel.findByIdAndUpdate(indicatorId, {$set: indicatorParams})
			req.flash("success", "The Animal Production Indicator Database has been updated")
			res.locals.redirect = `/indicator/new`
			next()
			
		} catch (error) {
			req.flash("error", `There was an error ${error.message}`)
			req.locals.redirect = "/indicator/new"
			next()
		}
	},
	deleteIndicator: async (req, res, next) => {
		try {
			let indicatorId = req.params.id
			const deleted = await LivestockIndicatorModel.findByIdAndRemove(indicatorId)
			req.flash("success", "The Animal Production Indicator Has been Deleted Successfully")
			res.locals.redirect = "/indicator/new"
			next()

			
		} catch (error) {
			req.flash("error", `There was an error ${error.message}`)
			res.locals.redirect("/indicator/new")
			next()
			
		}
	},
	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect
		if (redirectPath) res.redirect(redirectPath)
		else next()

	}


}
