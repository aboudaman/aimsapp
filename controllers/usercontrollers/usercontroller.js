"use strict"

const mongoose = require("mongoose")
const MemberStateModel = require("../../models/memberstates/MemberState")

// Import Express Validator
const { body, validationResult } = require('express-validator');

// Model to store Livestock Data
const LiveStock = require("../../models/livestocks/LiveStock")
const LiveStockModel = LiveStock.LiveStock

const LiveStockProductionModel = require("../../models/livestocks/LiveStockProduction")

const AnimalSlaughtered = require("../../models/livestocks/AnimalSlaughtered")
const  AnimalSlaughteredModel = AnimalSlaughtered.AnimalSlaughtered

//Load Model to store Livestock Indicator records
const LiveStockIndicator = require("../../models/indicators/LivestockIndicator")
const LiveStockIndicatorModel = LiveStockIndicator.LivestockIndicator

//Load User Model to store Livestock Indicator records
const User = require("../../models/user/User")
const UserModel = User.User

//# Load class to resize image and the path module
const Resize = require("../../middlewares/Resize")
const path = require("path")
const multer = require("multer")
const fs = require("fs")
const url = require("url")
const { userInfo } = require("os")

// Import BCryptJS
const bcrypt = require("bcryptjs")

// Import Passport
const passport = require("passport")

module.exports = {
	// index: (req, res, next) => {
	// 	UserModel.find()
	// 	.then(user => {
	// 	  res.locals.user = user;
	// 	  next();
	// 	})
	// 	.catch(error => {
	// 	  console.log(`Error fetching users: ${error.message}`);
	// 	  next(error);
	// 	});
	// },
	// indexView:(req, res, next) => {
	// 	res.render("users/index");
	// },
	createUserForm: async (req, res) => {
		res.render("users/createuser")

	},
	saveUser: async (req, res, next) => {
		try {
			if (req.skip) next()

			let formParams = {
				email: req.body.email,
				password: req.body.password
			}
			// console.log(formParams)
			// const email = formParams.email
			// const email2 = req.body.email2

			// Validate Form
			// body("email2", "Password Does Not Match").equals(email1)

			const newUser = new UserModel({
				email: req.body.email,
				password: req.body.password,
				role: req.body.role
			})

			UserModel.register(newUser, req.body.password, (error, user) => {
				if (user) {
					req.flash("success", "Account Created")
					res.locals.redirect=`/users/loginform`
					next()
				} else {
					req.flash("error", "Failed to create User Account")
					res.locals.redirect=`/users/createform`
					next()

				}

			})

			// bcrypt.genSalt(10, function(err, salt) {
			// 	bcrypt.hash(newUser.password, salt, function(err, hash) {
			// 		newUser.password = hash
			// 		newUser.save()
			// 	});
			// });

			// Save Livestock to Member State with corresponding ID
			
			// req.flash("success", "New User has been added")
			
			// next()
		}
		catch(error) {
			req.flash("error", `There was an error:${error.message}`)
			console.log(`${error.message}`)
			res.locals.redirect=`/users/createform`
			next()
		}
	},
	getUserLoginForm: async (req, res) => {
		// const livestock = await LiveStockModel.find({})
		// console.log(livestock)

		res.render("users/login")
	},
	authenticate: passport.authenticate('local', {
		failureRedirect: "/users/loginform",
		failureFlash: "Failed to login.  Please Check your username or password!!!",
		successRedirect: "/",
		successFlash: "Logged in!"
	}),
	logout: (req, res, next) => {
		req.logout()
		req.flash("success", "You have been logged out")
		res.locals.redirect = "/"
		next()
	},
	// authenticate: async (req, res, next) => {
	// 	const memberStates = await MemberStateModel.find({})

	// 	passport.authenticate('local'),
	// 	function(req, res) {
	// 	  // If this function gets called, authentication was successful.
	// 	  // `req.user` contains the authenticated user.
	// 	  res.redirect('/users/' + req.user.username);
	// 	}



	// 	UserModel.findOne({email: req.body.email})
	// 		.then(user => {
	// 			if (user && user.password === req.body.password) {
	// 				// res.redirect(`/memberstatecontrollers?user=${user}`)
	// 				res.locals.redirect = `/memberstates`
	// 				// res.render("memberstate/index", {user: user, memberStates: memberStates})
	// 				req.flash("success", "User Logged In Successfully")
	// 				res.locals.boom = 'booom'
	// 				next()
	// 			} else {
	// 				req.flash("error", "Error: Please check your email or password.")
	// 				res.locals.redirect = `/users/loginform`
	// 				next()
	// 			}
	// 		})
	// 		.catch(error => {
	// 			console.log('There was an error login')
	// 			next(error)
	// 		})

	// 	// req.flash("success", "Member State Has Been Added")
	// 	// res.locals.redirect = "/memberstates"

	// },
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
				data2: []
				})
		} catch (error) {
			if (error) console.log(`There was an error showing the charts ${error.message}`)
			next()
			
		}
	},
	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect
		if (redirectPath) res.redirect(redirectPath)
		else next()

	},

}
