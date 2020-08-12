"use strict"
/* Controller to set routes for each memberstate Information
 * This controller does not provide routes for production data
 * */

const mongoose = require("mongoose")

// Load Model for Memberstates
const MemberStateModel = require("../../models/memberstates/MemberState")

//Load Model for Core Crops records
const Crops = require("../../models/crops/Crops")
const CropsModel = Crops.CoreCrops

//Load Model to store Crops Indicator records
const CropIndicator = require("../../models/indicators/CropIndicator")
const CropIndicatorModel = CropIndicator.CropIndicator

//Load Model to store Livestock Indicator records
const LiveStockIndicator = require("../../models/indicators/LivestockIndicator")
const LiveStockIndicatorModel = LiveStockIndicator.LivestockIndicator

//Load Model to store livestock records
const LiveStock = require("../../models/livestocks/LiveStock")
const LiveStockModel = LiveStock.LiveStock

//Load Model to store Livestock Production records
const LiveStockProductionModel = require("../../models/livestocks/LiveStockProduction")

// Import cloudinary
const cloudinary = require("cloudinary").v2



//# Load class to resize image and the path module
const Resize = require("../../middlewares/Resize")
const path = require("path")
const multer = require("multer")

// const getSubDocuments = ((fieldName, fieldValue, populateField, modelName) => {
//   return modelName.findOne({ fieldName: fieldValue })
//     .populate(populateField).exec((err, values) => {
//       console.log(values);
//     })
// })
module.exports = {

	 saveMemberState: async (req, res, next) => {
		 try {


		let newMemberState = new MemberStateModel({
			countryName: req.body.countryName,
			population: req.body.population,
			// flag: req.body.img,
			area: req.body.area,
			currency: req.body.currency
		})
		console.log(req.file)
		console.log(req.file.path)
		console.log(req.file.public_id)
		// const img = {}
		// img.url = req.file.url
		// img.id = req.file.publice_id
		newMemberState.flagUrl = req.file.path
		// newMemberState.imgId = req.file.public_id
		// a5hvoqitfu1p0ih40iay
		// flag: res.locals.img

		  // upload image here

		//   cloudinary.uploader.upload(`${imgLoc}/${res.locals.img}`)
		//   .then((image) => {
		// 	console.log(image.public_id)

		// 	newMemberState.save()

		//   })
		//   .catch(e => {
		// 	  console.log(e)

		//   })
		
		// console.log(`The value in the dropdown is ${req.body.selectlivestock}`)
		// if (!res.locals.img) {
		// 	console.log("No Flags")

		// }
		await newMemberState.save()
		req.flash("success", "Member State Has Been Added")
		res.locals.redirect = "/memberstate/new"
		next()
		 }
		 catch(e) {
			 req.flash("Error", `There was an error ${e.message}`)
			console.log(`There was an error ${e.message}`)
			next()
		 }

	},
	index: (req, res, next) => {
		//res.send('Entry Point')

		MemberStateModel.find({})
			.then((memberstates) => {
				console.log(memberstates)
				res.locals.memberStates = memberstates
				res.locals.user = req.query.user
				next()
				})
			.catch(error => {
				if (error) throw error
			})
			
	},
	indexView: (req, res) => {
		res.render("memberstate/index")

	},
	editMemberState: (req, res, next) => {
		let memberId = req.params.id
		
		MemberStateModel.findById(memberId)
			.then(memberstate => {
				res.render("memberstate/editmemberstate", {memberstate: memberstate})
			})
			.catch(error => { if (error) throw error})
	},

	update: async (req, res, next) => {
	try {
		let memberId = req.params.id
		
		// let livestockParams = {
		// 	liveanimals: req.body.livestock,
		// }

		let memberParams = {
			countryName: req.body.countryName,
			area: req.body.area,
			currency: req.body.currency,
			population: req.body.population,
		}

		// console.log(req.file)
		if (req.file.path) {
			memberParams.flagUrl = req.file.path
		}
		

		const findMember = await MemberStateModel.findByIdAndUpdate(memberId,{$set: memberParams})
		req.flash("success", "Memberstate Has Been Updated!!!")
		res.locals.redirect=`/memberstate/${memberId}`
		next()
	}
	
	catch(e) {

			console.log(`there was an error ${e.message}`)
	}

	finally {}
		/*
		MemberStateModel.findByIdAndUpdate(memberId, {
			$set: memberParams
		})
			.then(() => {

				LiveAnimalModel.updateOne({}, {$set: livestockParams})
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
		*/


	},
	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect
		if (redirectPath) res.redirect(redirectPath)
		else next()

	},

	getMemberStateForm: async (req, res) => {
		const livestock = await LiveStockModel.find({})
		// console.log(livestock)

		res.render("memberstate/creatememberstate", {livestock: livestock})
	},
	showMemberState: async (req, res, next) => {
		try {
			let memberId = req.params.id
			const memberState = await MemberStateModel.findById({_id: memberId})

		//## Begin loading SubDocuments ##	
			// const liveAnimalID = memberState.liveanimals
			// const commentPromises = liveAnimalID.map(_id => {
			//   return LiveStockProductionModel.findOne({ _id })
			// })
			// const liveAnimalsData = await Promise.all(commentPromises)
		//## END Loading Sub Documents ##

			// const memberStateLive = await MemberStateModel.findOne({countryName: "Botswana"}).populate("name").exec()
			// res.locals.liveAnimalsData = liveAnimalsData
			res.locals.memberState = memberState
			next()

		} catch(error) {
			
			if (error) throw error
			
		}
	},
	showMemberStateView: (req, res) => {
		res.render("memberstate/memberstate")
	},
	deleteMemberState:(req, res, next) => {

		let memberId = req.params.id
		MemberStateModel.findByIdAndRemove(memberId)
			.then(() => {
				res.locals.redirect = "/memberstates"
				next()
			})
			.catch(error => {
				if (error) throw error
				console.log(`There was an error deleting the member ${error.message}`)
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
	dataList: (req, res) => {
		MemberStateModel.find({})
			.then((memberstates) => {
				res.render("memberstate/datalist", {members: memberstates})
			})
			.catch(error => {
				if (error) throw error
			})

	},
	aChart: (req, res) => {
		MemberStateModel.find({})
			.then((memberstates) => {

				res.render("memberstate/aimscharts", {members: memberstates, url: "graphs"})	
			})
			.catch(error => {

				if (error) console.log(`There was an error showing the charts ${error.message}`)
				next()
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
	showProdDashboard: async (req, res, next) =>  {
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
	},
	// showProdDashboardView: (req, res) =>  {
	// 	res.render("dashboard/dashboard")

	// },
	showDashboard: async (req, res, next) =>  {
		try {
			const memberState = await MemberStateModel.find({})
			const coreCropsItems = await CropsModel.find({})
			const cropIndicatorsList = await CropIndicatorModel.find({})

			// ## Begin Loading Sub Documents
	
			// ## END Loading 
			const sadcMemberStates = [... new Set 
					(memberState.map (n => n.countryName))]
			
			// console.log(sadcMemberStates)
			sadcMemberStates.sort()
			// console.log(sadcMemberStates)

			const crops = [... new Set(coreCropsItems.map(c=>c.crop))]
								.sort()
			
			const indicators = [... new Set(cropIndicatorsList.map(i => i.indicator))]
								.sort()

			res.locals.members = sadcMemberStates
			res.locals.coreCrops = crops
			res.locals.cropIndicators = indicators
			res.locals.memberState = memberState

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
