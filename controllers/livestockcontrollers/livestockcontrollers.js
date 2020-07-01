"use strict"

const mongoose = require("mongoose")
const MemberState = require("../../models/memberstates/MemberState")
const MemberStateModel = MemberState.MemberState

const LiveStock = require("../../models/livestocks/LiveStock")
const LiveStockModel = LiveStock.LiveStock

const LiveStockProduction = require("../../models/livestocks/LiveStockProduction")
const LiveStockProductionModel = LiveStockProduction.LiveStockProduction
///# Load class to resize image and the path module
const Resize = require("../../middlewares/Resize")
const path = require("path")
const multer = require("multer")


module.exports = {
	saveLiveStock:async (req, res, next) => {
		const livestocks = await LiveStockModel.find({})
		let newLiveAnimal = new LiveStockModel({
			name: req.body.animalName,
		})
		newLiveAnimal.save()
			.then(() => {
				//res.locals.message = req.flash()
			//	res.locals.livestocks = livestocks
				req.flash("success", "Livestock Added!!!")
				//res.render("liveanimal/createliveanimal", {success: "success", livestocks: livestocks})
				res.locals.redirect = "/livestock/new"
				next()
			})
			.catch(error => {
				res.locals.redirect = "/livestock/new"
				req.flash("error", `There was an error ${error.message}`)
				next()
			//	if (error) res.send(error)
			})
	},
	index: (req, res, next) => {
		//res.send('Entry Point')

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
	editLivestock: async (req, res, next) => {
		try {
			let livestockId = req.params.id
			const livestock = await LiveStockModel.findById(livestockId)
			res.render("liveanimal/editlivestockdata", {livestock: livestock})
		}
		catch(error) {
			throw error.message

		}
	
	},
	update: async (req, res, next) => {
		try {

			let livestockId = req.params.id
			let livestockParams = {
				name: req.body.livestockName
			}
			const updatedLivestock = await LiveStockModel.findByIdAndUpdate(livestockId, {$set: livestockParams})
			req.flash("success", "The Livestock Database has been updated")
			res.locals.redirect = `/livestock/new`
			next()
		}
		catch(error) {
			req.flash("error", `There was an error: error.message`)
			next()
		}
	},
	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect
		if (redirectPath) res.redirect(redirectPath)
		else next()

	},

	getLiveStockForm: async (req, res) => {
		try {
		const livestocks = await LiveStockModel.find({})
		const memberId = req.params.id
		const memberState = await MemberStateModel.findById(memberId)
		const livestockItem = [... new Set(livestocks.map(l => l.name))]
								.sort()
			


		res.render("liveanimal/createliveanimal", {livestocks: livestocks, memberState: memberState})
		}
		catch(error) {
			req.flash("error", "There was an error")
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
	deleteLivestock:(req, res, next) => {

		let livestockId = req.params.id
		LiveStockModel.findByIdAndRemove(livestockId)
			.then(() => {
				//res.render("liveanimal/createliveanimal")
				req.flash("success", "Livestock Deleted!!!")
				res.locals.redirect = "/livestock/new"
				next()
			})
			.catch(error => {
				req.flash("error", `There was an error Deleting the Livestock ${error.message}`)
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
