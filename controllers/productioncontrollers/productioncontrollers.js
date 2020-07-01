"use strict"

const mongoose = require("mongoose")
const MemberStateModel = require("../../models/memberstates/MemberState")

// Model to store Livestock Data
const LiveStock = require("../../models/livestocks/LiveStock")
const LiveStockModel = LiveStock.LiveStock

// Load Livestock Indicators
const LivestockIndicator = require("../../models/indicators/LivestockIndicator")
const LiveStockIndicatorModel = LivestockIndicator.LivestockIndicator

const LiveStockProductionModel = require("../../models/livestocks/LiveStockProduction")

const AnimalSlaughtered = require("../../models/livestocks/AnimalSlaughtered")
const  AnimalSlaughteredModel = AnimalSlaughtered.AnimalSlaughtered


//# Load class to resize image and the path module
const Resize = require("../../middlewares/Resize")
const path = require("path")
const multer = require("multer")
const fs = require("fs")
const url = require("url")
const { find } = require("../../models/livestocks/LiveStockProduction")
// const LivestockIndicator = require("../../models/indicators/LivestockIndicator")

module.exports = {
	saveLiveStock: async (req, res, next) => {
		try {
			console.log("Inside SaveLivestock")
			let memberId = req.params.id
			let formParams = {
				livestock: req.body.selectlivestock,
				quantity: req.body.quantity,
				year: req.body.year
			}

			const memberState = await MemberStateModel.findById(memberId)
			const name = memberState.countryName

			const livestock = new LiveStockProductionModel({
				livestock: req.body.selectlivestock,
				quantity: req.body.quantity,
				year: req.body.year,
				// indicator: req.body.indicator,
				memberState: memberState._id
			})
			console.log()
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
			// console.log(`LiveAnimals: ${liveAnimalsData}`)

			const aNames = [... new Set(liveAnimalsData.map(d => d.name ))]
			const aYear = [... new Set(liveAnimalsData.map(d => d.year )
														.filter(item => item !== undefined))]
			aNames.sort()
			aYear.sort()

			// const aFilter = aYear.filter(item => item !== undefined)
			// console.log(aYear)

		//## END Loading Sub Documents ##

			res.locals.liveStockProductionData = liveAnimalsData
			res.locals.liveStockNames = aNames
			res.locals.liveStockYear = aYear
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
	editProductionData:async (req, res, next) => {
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
	edit: async (req, res, next) => {
		try {
		const memberId = req.params.id
		// console.log("inside edit")
		// console.log(memberId)
		const memberState = await MemberStateModel.findById(memberId)

		const name = memberState.countryName

		const handleView = (data) => {
			// console.log(data)
			res.render("production/edittable",{memberState: memberState, 
			livestocks: data})
		}

		await LiveStockProductionModel
							.find({memberState : memberState._id},'livestock quantity year')
							.populate('memberState', 'countryName')
							.exec((function (err, results) {
								if (err) return next(err);
								handleView(results)
							  }))
		}
		catch(error) {
			req.flash("error", `There was an error: ${error.message}`)
			if (error) throw error
		}
	},
	editdata:async (req, res, next) => {
		try {
		const memberId = req.params.id1
		const livestockId = req.params.id2
		const memberState = await MemberStateModel.findById(memberId)
		const livestock = await LiveStockProductionModel.findById(livestockId)
		const livestockIndicators = await LiveStockIndicatorModel.find({})
		// console.log(livestockId)

		const handleView = (data) => {
			// console.log(data)
			res.render("production/editdata",{memberState: memberState, 
					livestock: data, livestockIndicators: livestockIndicators})
		}

		await LiveStockProductionModel
				.findOne({livestock: livestock.livestock },'livestock quantity year')
				.populate('memberState', 'countryName')
				.exec((function (err, results) {
					if (err) return next(err);
					handleView(results)
				}))
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
				livestock: req.body.livestock,
				quantity: req.body.quantity,
				year: req.body.year
				// indicator: req.body.indicator
			}

			console.log(livestockParams.indicator)

			const handleView = () => {

				req.flash("success", "Production Data Updated Successfully")
				res.locals.redirect=`/production/${memberId}/livestock/edit`
				next()

			}

			const memberState = await MemberStateModel.findById(memberId)
			await LiveStockProductionModel
			.findByIdAndUpdate(liveAnimalId, {$set: livestockParams })
			.exec((function (err, results) {
				if (err) return next(err);
				handleView()
			}))

		}
		catch(error) {
			req.flash("error", `There was an error ${error.message}: `)
			console.log(error.message)
			if (error) throw error
		}
	},
	
	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect
		if (redirectPath) res.redirect(redirectPath)
		else next()

	},

	getLivestockForm: async (req, res) => {

		const livestocks = await LiveStockModel.find({})
		const memberId = req.params.id
		const member = await MemberStateModel.findById(memberId)

		res.render("memberstate/addlivestockdata", {livestocks: livestocks, memberState: member})
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
	delete: async (req, res, next) => {
		try {
			let memberId = req.params.id1
			let productionId = req.params.id2
			LiveStockProductionModel.findByIdAndDelete({"_id":productionId},function(){})

			req.flash("success", "The record has been removed successfully!!!")
			res.locals.redirect = `/production/${memberId}/livestock/edit`
			next()
			
		} catch (error) {
			req.flash("error", "There was an error removing the data")
			if (error) throw error
			console.log(`There was an error deleting the livestock ${error.message}`)
			next()
			
		}
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

	},
	analytics: async(req, res, next) => {

		try {
			console.log("##########################")
			console.log("Inside Analytics")
			let memberId = req.params.id

			//console.log(memberId)
			const memberState = MemberStateModel.findById(memberId)
			
			// console.log(`MemberState: ${memberState}`)

			//## Begin loading SubDocuments ##	
			/*
			const liveAnimalID = memberState.liveanimals
			const liveAnimalPromises = liveAnimalID.map(_id => {
			  return LiveStockProductionModel.findOne({ _id })
			})
			const liveAnimalsData = Promise.all(liveAnimalPromises)
			*/

			//## END Loading Sub Documents ##
		
			//console.log(`body:`)
			let formElements = {
				name: req.body.livestock,
				year: req.body.year,
				// indicator: req.body.indicator

			}

			console.log(`Elements from Form: ${formElements.year} and  ${formElements.name} and ${formElements.indicator}  `)	
			
			const series = await LiveStockProductionModel.find().where({name: formElements.name}).and({year: formElements.year})		
			//console.log(`Elements found from queries: ${series}`)
			let seriesJSON = JSON.stringify(series)

			console.log(`seriesJSON: ${seriesJSON}`)

			//Set up callback to fire when file is created
			const cb = (error) => {
				console.log("Error: ", error)
				console.log("The File has been written")
			}

			//Set up path to write the file
			let fPath = path.join(__dirname, '../../public/reports', 'myFile.txt')

			fs.writeFile(fPath, seriesJSON, cb) 

			//res.json({"inside": series})
			//let obj = {}
			//let key = "responses"
			//obj[key] = []
			//obj[key].push(series)

			//const jResponse = JSON.stringify(obj)
			//console.log(jResponse)
			//console.log(`Elements in the series: ${series}`)
			//res.locals.memberState = memberState
			//res.locals.chartValues = jResponse
			
			req.flash("loaded", "Query Submitted")
			//res.locals.redirect=`/production/${req.params.id}/livestock/view`
			res.json({data: series})

			//next()

		}
		catch(error) {
			if (error) console.log('There was an error in the query')

		}

	},
	analyticsView: async (req, res) => {
		try {
			// Shows Analytics information for all Member States by sending JSON response

			console.log('inside Analytics View')

			let formElements = {
				year: req.body.year,
				// quantity: req.body.indicator,
				livestock: req.body.livestock,
				memberState: req.body.member
			}

			console.log(formElements.livestock)
			// console.log(formElements.memberState)
			const member =  await MemberStateModel.find({countryName: formElements.memberState})

			// find each person with a last name matching 'Ghost'
			var query = MemberStateModel.find({ countryName: formElements.memberState });

			// selecting the `population` and `_id` fields
			query.select('population _id');

			// execute the query at a later time
			query.exec(function (err, person) {
				if (err) return err;
				// Prints "Space Ghost is a talk show host."
				// console.log(person);
			});

			// console.log(member)
			const handleView = (data) => {
				let result = []
				console.log(data)
				let d = new Date()
				data.forEach(obj => {
					result.push({
						memberState: obj.memberState.countryName,
						livestock: obj.livestock,
						quantity: obj.quantity,
						// year: new Date(obj.year).getFullYear()
						year: new Date(obj.year)
					})

				})
				// console.log(result)
				// console.log(data)
				res.json({data: result})
				// res.render("production/edittable",{memberState: memberState, 
				// livestocks: data})
			}

			// START Working Code
	
			// await LiveStockProductionModel
			// 					.find({memberState : member},'livestock quantity year')
			// 					.populate('memberState')
			// 					.exec((function (err, results) {
			// 						if (err) return next(err);
			// 						handleView(results)
			// 					  }))

			// END Working Code

			// populates an array of objects

			// START Test Code
			await LiveStockProductionModel
					.find({memberState : member},'livestock quantity year')
					// Populate MemberState Field and Pick the Country Name
					.populate('memberState countryName')
					.where({livestock: formElements.livestock, indicator:formElements.indicator})
					.exec((function (err, results) {
						if (err) return next(err);
						handleView(results)
			}))

			// END Test Code




		} catch (error) {
			
		}
	},
}
