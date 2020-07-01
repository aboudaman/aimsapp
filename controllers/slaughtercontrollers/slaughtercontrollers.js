"use strict"

const mongoose = require("mongoose")
const MemberState = require("../../models/memberstates/MemberState")
const MemberStateModel = MemberState.MemberState

const LiveStock = require("../../models/livestocks/LiveStock")
const LiveStockModel = LiveStock.LiveStock

const LiveStockProduction = require("../../models/livestocks/LiveStockProduction")
const LiveStockProductionModel = LiveStockProduction.LiveStockProduction

const AnimalSlaughtered = require("../../models/livestocks/AnimalSlaughtered")
const  AnimalSlaughteredModel = AnimalSlaughtered.AnimalSlaughtered

//# Load class to resize image and the path module
const Resize = require("../../middlewares/Resize")
const path = require("path")
const multer = require("multer")

module.exports = {

	save: async (req, res, next) => {
		try {
			let livestock =  req.body.selectlivestock
			let memberId = req.params.id

			//Find the Memberstate
			const memberState = await MemberStateModel.findById(memberId)
			
			const livestockData = new LiveStockProductionModel({

				name: req.body.selectlivestock,
				quantity: req.body.quantity,
				year: req.body.year
			})
			const savedLivestock = await livestockData.save()
			//Add the livestock to the memberstate
			memberState.liveanimals.push(savedLivestock)

			//Save the memberstate
			const savedMemberState = await memberState.save()

			req.flash("success", "Livestock Production Data has been Added")
			res.locals.redirect=`/production/${req.params.id}/livestock/new`
			next()

		}
		catch(error) {
			req.flash("error", `There was an error:${error.message}`)
			console.log(`${error.message}`)
			res.locals.redirect=`/production/${req.params.id}/livestock/new`
			next()

		}
		finally {}
	},
	index: async (req, res, next) => {
		let memberId = req.params.id
		try {
			const memberState = await MemberStateModel.findById(memberId)

		//## Begin loading SubDocuments ##	

			const liveAnimalID = memberState.liveanimals
			const liveAnimalPromises = liveAnimalID.map(_id => {
			  return LiveStockProductionModel.findOne({ _id })
			})
			const liveAnimalsData = await Promise.all(liveAnimalPromises)

		//## END Loading Sub Documents ##

			res.locals.liveStockProductionData = liveAnimalsData
			res.locals.memberState = memberState
			next()

		}
		catch(error) {

			req.flash("error", `There was an error: ${error.message}`)
			next()
		}
	},
	indexView: (req, res) => {
		res.render("memberstate/memberstateproduction")

	},
	editSlaughterData:async (req, res, next) => {
		try {
		const memberId = req.params.id1
		const livestockId = req.params.id2
		const memberState = await MemberStateModel.findById(memberId)

		//## Begin loading SubDocuments ##	
		const liveAnimalID = memberState.liveanimals
		const liveAnimalPromises = liveAnimalID.map(_id => {
		  return LiveStockProductionModel.findOne({ _id })
		})
		const liveAnimalsData = await Promise.all(liveAnimalPromises)
		//## END Loading Sub Documents ##
		
		const productionData = await LiveStockProductionModel.findById(livestockId)
		
		res.render("memberstate/editproductiondata",{productionData: productionData, memberState: memberState})

		}
		catch(error) {
			req.flash("error", `There was an error: ${error.message}`)
			if (error) throw error
		}
	},
	update:async (req, res, next) => {
		try {
			const memberId = req.params.id1
			const liveAnimalId = req.params.id2
			const livestockParams = {
				quantity: req.body.quantity,
				year: req.body.year
			}
			const memberState = await MemberStateModel.findById(memberId)
			//## Begin loading SubDocuments ##	
			const liveAnimalID = memberState.liveanimals
			const liveAnimalPromises = liveAnimalID.map(_id => {
			  return LiveStockProductionModel.findOne({ _id })
			})
			const liveAnimalsData = await Promise.all(liveAnimalPromises)
			//## END Loading Sub Documents ##

			const liveAnimalUpdate = await LiveStockProductionModel.findByIdAndUpdate(liveAnimalId, {$set: livestockParams })
			req.flash("success", "Production Data Updated Successfully")
			res.locals.redirect=`/production/${memberId}/livestock/view`
			next()
			}
		catch(error) {
			req.flash("error", `There was an error ${error.message}: `)
			console.log(error.message)
			if (error) throw error
		}
	
/*
		let memberId = req.params.id
		MemberStateModel.findById(memberId)
			.then(memberstate => {
				res.render("memberstate/editmemberstate", {memberstate: memberstate})
			})
			.catch(error => { if (error) throw error})
	
*/
	},
	/*
	update: (req, res, next) => {
		let memberId = req.params.id
		let memberParams = {
			countryName: req.body.countryName,
			population: req.body.population
		}
		MemberStateModel.findByIdAndUpdate(memberId, {
			$set: memberParams
		})
			.then(memberstate => {

				res.locals.redirect = `/memberstate/${memberId}`
				res.locals.memberstate = memberstate
				next()
			})
			.catch(error => {
				if (error) throw error
				console.log(`There was a problem editing the memberstate ${error.message}`)
				//next(error)
			})
	},
	*/
	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect
		if (redirectPath) res.redirect(redirectPath)
		else next()

	},

	getSlaughterForm: async (req, res) => {
		try {

		const slaughter = await AnimalSlaughteredModel.find({})
		const memberId = req.params.id
		const member = await MemberStateModel.findById(memberId)
		const livestocks = await LiveStockModel.find({})
		res.render("memberstate/addslaughterdata", {slaughter: slaughter, memberstate: member, livestocks:livestocks})
		}
		catch(error) {
			if (error) throw error.message

		}
		},
	showMemberState: (req, res, next) => {

		let memberID = req.params.id
		MemberStateModel.findById(memberID)
			.then(memberState => {
				res.locals.memberState = memberState
				next()
			})
			.catch(error => {
				if (error) throw error
			})
	},
	showMemberStateView: (req, res) => {

		res.render("memberstate/memberstate")
	},
	deleteSlaughter:(req, res, next) => {

		let productionId = req.params.id
		LiveStockProductionModel.findByIdAndRemove(productionId)
			.then(() => {
				req.flash("success", "Data has been removed successfully!!!")
				res.locals.redirect = "/livestock/new"
				next()
			})
			.catch(error => {
				req.flash("error", "There was an error removing the data")
				if (error) throw error
				console.log(`There was an error deleting the livestock ${error.message}`)
				next()
			})
		
	},
	showData: (req, res) => {
		MemberStateModel.find({})
			.then((memberstates) => {
				res.render("memberstate/list", {members: memberstates})
			})
			.catch(error => {
				if (error) throw error
			})

	},
	showChart: (req, res) => {
		MemberStateModel.find({})
			.then((memberstates) => {

				res.render("memberstate/graphs", {members: memberstates, url: "graphs"})	
			})
			.catch(error => {

				if (error) console.log(`There was an error showing the charts ${error.message}`)
				next()
			})

	},
	chartApi: async (req, res, next) => {
		try {
		let memberId = req.params.id
		const memberState = await MemberStateModel.findById(memberId)
			
		//## Begin loading SubDocuments ##	
		const liveAnimalID = memberState.liveanimals
		const liveAnimalPromises = liveAnimalID.map(_id => {
		  return LiveStockProductionModel.findOne({ _id })
		})
		const liveAnimalsData = await Promise.all(liveAnimalPromises)
		//## END Loading Sub Documents ##
		
//		console.log(liveAnimalsData)


		res.json({members: memberState, liveAnimalsData: liveAnimalsData})

		}
		catch(error) {

			if (error) throw error
			next()
		}
		/*
		MemberStateModel.find({})
			.then((memberstates) => {
				res.json({"members": memberstates})

			})
			.catch(error => {
				if (error) console.log(`There was an error showing the charts ${error.message}`)
				next()
			})
		*/

	}
}
