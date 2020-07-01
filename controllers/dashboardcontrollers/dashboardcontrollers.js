"use strict"

const mongoose = require("mongoose")
const MemberStateModel = require("../../models/memberstates/MemberState")

// Model to store Livestock Data
const LiveStock = require("../../models/livestocks/LiveStock")
const LiveStockModel = LiveStock.LiveStock

const LiveStockProductionModel = require("../../models/livestocks/LiveStockProduction")

const AnimalSlaughtered = require("../../models/livestocks/AnimalSlaughtered")
const  AnimalSlaughteredModel = AnimalSlaughtered.AnimalSlaughtered

//Load Model to store Livestock Indicator records
const LiveStockIndicator = require("../../models/indicators/LivestockIndicator")
const LiveStockIndicatorModel = LiveStockIndicator.LivestockIndicator

//# Load class to resize image and the path module
const Resize = require("../../middlewares/Resize")
const path = require("path")
const multer = require("multer")
const fs = require("fs")
const url = require("url")

module.exports = {
	saveLiveStock: async (req, res, next) => {
		try {
			console.log("Inside SaveLivestock")
			let memberId = req.params.id
			let formParams = {
				name: req.body.selectlivestock,
				quantity: req.body.quantity,
				year: req.body.year
			}

			const memberState = await MemberStateModel.findById(memberId)
			const name = memberState.countryName

			const livestock = new LiveStockProductionModel({
				name: req.body.selectlivestock,
				quantity: req.body.quantity,
				year: req.body.year,
				memberState: memberState._id
			})
			// Save Livestock to Member State with corresponding ID
			await livestock.save()
			req.flash("success", "Livestock Data has been Added To The Database")
			res.locals.redirect=`/production/${req.params.id}/livestock/new`
			next()
		}
		catch(error) {
			req.flash("error", `There was an error:${error.message}`)
			console.log(`${error.message}`)
			res.locals.redirect=`/production/${req.params.id}/livestock/new`
			next()

		}
    },
    showProdDashboard: async (req, res, next) =>  {
        // Main Dashboard Page
		const memberId = req.params.id
		try {
			const memberState = await MemberStateModel.findById(memberId)

		res.render("dashboard/dashboard", {memberState: memberState})
		} catch (error) {
			if (error) console.log(`There was an error showing the charts ${error.message}`)
			next()
			
		}
	},
	showProdAnalytics: async (req, res, next) =>  {
        // Analytics Page showing different graphs and reports
		
		try {
			// console.log("inside analytics")
			const memberId = req.params.id
			
			const memberStatesList = await MemberStateModel.find({})
			// const coreCropsItemsList = await CropsModel.find({})
			// const cropIndicatorsList = await CropIndicatorModel.find({})
			const livestockList = await LiveStockModel.find({})
			const liveStockIndicatorsList = await LiveStockIndicatorModel.find({})

			// console.log(`Member List: ${memberStatesList}`)
			// console.log(`Livestock List: ${livestockList}`)
			// console.log(`Livestock Indicator List: ${liveStockIndicatorsList}`)

			// #### Generate list for analytics page ####
			const livestocks = [... new Set(livestockList.map(l=>l.name))]
									.sort()
			
			const memberStates = [... new Set(memberStatesList.map(m=>m.countryName))]
									.sort()

			const liveStockIndicators = [... new Set(liveStockIndicatorsList.map(l=>l.indicator))]
									.sort()


			// #### END Generate list for analytics page ####

			// console.log(livestocks)
			// console.log(memberStates)
			// console.log(liveStockIndicators)

		res.render("dashboard/dashboardlivestock", 
			{memberStates: memberStates, livestocks: livestocks, 
				liveStockIndicators: liveStockIndicators,
				})
		} catch (error) {
			if (error) console.log(`There was an error showing the charts ${error.message}`)
			next()
			
		}
	}
    


}
