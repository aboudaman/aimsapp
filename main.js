"use strict"

const mongodb = require("mongodb")
const mongoose = require("mongoose")
const express = require("express")
const MemberStateModel = require("./models/memberstates/MemberState")
const favicon = require("serve-favicon")
const path = require("path")
const methodOverride = require('method-override')
const bodyParser = require("body-parser")
const multer = require("multer")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const connectFlash = require("connect-flash")
const passport = require("passport")
// const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")
//Load User Model to store Livestock Indicator records
const User = require("./models/user/User")
const UserModel = User.User


//## Middleware for Uploads
const upload = require("./middlewares/uploadmiddleware")
const uploadMiddleware =  upload.upload

//## Configure middlewares for PDF Exports
const pdf = require('express-pdf')
// const DocumentsModel = require('./models/memberstates/MemberState')
const pdfClass = require('./middlewares/PDF')

// const dbUrl = "mongodb://localhost:27017"
// const dbName = "aims"
//Set up mongoose connection
mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/aims', 
			{
				useNewUrlParser: true, 
				useUnifiedTopology: true,
				useCreateIndex: true,
				useFindAndModify: false
			 })
		.catch(error => console.log(error))
// mongoose.connect('mongodb://localhost:27012/aims', {useNewUrlParser: true,
// 					 useUnifiedTopology: true, useCreateIndex: true })
// mongoose.set('useFindAndModify', false)
//Assign mongoose connection instance to a variable
const db = mongoose.connection

//Sends message once connected to database
db.once("open", () => {
	console.log("Connected to DB")

})

//## Load Class to resize images
const Resize = require("./middlewares/Resize")

//Instructs mongoose to use native promise
mongoose.Promise = global.Promise

//Set up variables
const app = express()

const layout = require("express-ejs-layouts")
app.use(express.static("public"))
app.use(favicon(path.join(__dirname, "public/images", "favicon.ico")))
const router = express.Router();

//## use pdf middleware
app.use(pdf)


// Set up middlewares
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(layout)




//const port = 4000
app.set("view engine", "ejs")
app.set("port", process.env.PORT || 3000)


//## Load controllers ##
const homeController = require('./controllers/homeController')
const memberStateController = require('./controllers/memberstatecontrollers/memberstatecontrollers')
const errorController = require('./controllers/errors/errorcontroller')
const liveStockController = require('./controllers/livestockcontrollers/livestockcontrollers')
const productionController = require('./controllers/productioncontrollers/productioncontrollers')
const slaughterController = require('./controllers/slaughtercontrollers/slaughtercontrollers')
const cropController = require('./controllers/cropcontrollers/cropcontrollers')
const indicatorController = require('./controllers/indicatorcontrollers/indicatorcontrollers')
const cropsIndicatorController = require('./controllers/indicatorcontrollers/crops/cropindicatorcontrollers')
const livestockIndicatorController = require('./controllers/indicatorcontrollers/livestock/livestockindicatorcontrollers')
const animalproductionIndicatorController = require('./controllers/indicatorcontrollers/production/animalproductioncontrollers')
const dashboardController = require('./controllers/dashboardcontrollers/dashboardcontrollers')
const userController = require('./controllers/usercontrollers/usercontroller')

//## END Load Controllers ##

app.use("/", router)
router.use(methodOverride("_method", {
	methods: ["POST", "GET"]

}))

//Load modules for Flash Messages

router.use(cookieParser("secret_passcode"))
router.use(session({
	secret: "secret_passcode",
	cookie:{
		maxAge: 6000000
	},
	resave: true,
	saveUninitialized: true
}))

// Set up Passport
router.use(passport.initialize())
router.use(passport.session())
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

// Set up validator

router.use(connectFlash())

router.use((req,res, next) => {
	res.locals.flashMessages = req.flash()
	res.locals.loggedIn = req.isAuthenticated();
	res.locals.currentUser = req.user
	next()
})

//Set up Get Routes
router.get("/", homeController.homeController)

//#### Set up GET Routes for Memberstates ####
router.get("/memberstates", memberStateController.index, memberStateController.indexView)
router.get("/memberstate/new", memberStateController.getMemberStateForm)
router.post("/memberstate/register", uploadMiddleware.single("flag"), async function (req, res, next) {
	const imagePath = path.join(__dirname, "/public/images/flags")
	const fileUpload = new Resize(imagePath)
	const file = req.file
	if (!file) console.log("Error - No files uploaded")
	const filename = await fileUpload.save(file.buffer)
	res.locals.img = filename
	console.log("uploaded")
	next()

}, memberStateController.saveMemberState, memberStateController.redirectView)
router.get("/memberstate/:id", memberStateController.showMemberState, memberStateController.showMemberStateView)
router.get("/memberstate/:id/editmemberstate", memberStateController.editMemberState)

//Set up update Routes for Memberstates
router.put("/memberstate/:id/update", memberStateController.update, memberStateController.redirectView)

//Set up Delete Routes for Memberstates
router.delete("/memberstate/:id/deletememberstate", memberStateController.deleteMemberState, memberStateController.redirectView)

//Create Route to export to PDF
// router.get("/export", (req, res)=> {
// 	DocumentModel.find({})
// 		.then(doc => {
// 			let renderer = new pdfClass()
// 			let html = doc.countryName

// 			renderer.setCSS("/css/pdf.css")
// 			renderer.build(html)
			
// 			//express-pdf kicks in
// 			res.pdfFromHTML({
// 				filename: `sadc.pdf`,
// 				htmlContent: `Me too`
// 			})
// 		})
// 		.catch(error => {
// 			console.log(`There was an error ${error}`)
// 		})


// })

//Set up route to export to Excel, CSV

// router.get("/list", memberStateController.showData)

//Set up route for import, export excel and csv
// router.get("/datalist", memberStateController.dataList)

//Set up route to display graphs
// router.get("/graphs", memberStateController.showChart)

//#### Chart Example on data ####
// router.get("/aimsgraphs", memberStateController.aChart)

//router.get("/graphsapi/:id", memberStateController.chartApi)

//Set up POST Route to register Member States

// #### END CRUD Routes for Member States

// #### SET up Authentication for application ####
router.get("/users/createform", userController.createUserForm)
// router.get("/users", userController.index, userController.indexView);
router.post("/users/register", userController.saveUser, userController.redirectView)

router.get("/users/loginform", userController.getUserLoginForm)
router.post("/users/login", userController.authenticate)
router.get("/users/logout", userController.logout, userController.redirectView)

// app.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/users/' + req.user.username);
//   });

// #### END Authentication


//#### SET up CRUD to Add Livestock Information to the database ####

router.get("/livestock/new", liveStockController.getLiveStockForm)
router.post("/livestock/register", liveStockController.saveLiveStock, liveStockController.redirectView)
router.delete("/livestock/:id/deletelivestock", liveStockController.deleteLivestock, liveStockController.redirectView)
router.get("/livestock/:id/editlivestock", liveStockController.editLivestock)
router.put("/livestock/:id/update", liveStockController.update, liveStockController.redirectView)

//#### SET up CRUD For Core Crops ####

router.get("/crop/new", cropController.getCropForm)
router.post("/crop/register", cropController.saveCrop, cropController.redirectView)
router.get("/crop/:id/editcrop", cropController.editCrop)
router.put("/crop/:id/update", cropController.update, cropController.redirectView)
router.delete("/crop/:id/deletecrop", cropController.deleteCrop, cropController.redirectView)

//#### SET up CRUD FOR Indicator Page ####
router.get("/indicator/new", indicatorController.getIndicatorForm)

//#### SET up CRUD FOR Crops Indicators ####
router.post("/indicatorcrops/register", cropsIndicatorController.saveIndicator, cropsIndicatorController.redirectView)
router.get("/indicatorcrops/:id/edit", cropsIndicatorController.editIndicator)
router.put("/indicatorcrops/:id/update", cropsIndicatorController.update, cropsIndicatorController.redirectView)
router.delete("/indicatorcrops/:id/delete", cropsIndicatorController.deleteIndicator, cropsIndicatorController.redirectView)
//  #### END CRUD Routes for Crops Indicators ####

//#### SET up CRUD FOR Livestock Indicators ####
router.post("/indicatorlivestock/register", livestockIndicatorController.saveIndicator, livestockIndicatorController.redirectView)
router.get("/indicatorlivestock/:id/edit", livestockIndicatorController.editIndicator)
router.put("/indicatorlivestock/:id/update", livestockIndicatorController.update, livestockIndicatorController.redirectView)
router.delete("/indicatorlivestock/:id/delete", livestockIndicatorController.deleteIndicator, livestockIndicatorController.redirectView)
//#### END CRUD Routes for Crops Indicators ####

//#### SET up CRUD FOR Animal Production Indicators ####
router.post("/indicatoranimalprod/register", animalproductionIndicatorController.saveIndicator, animalproductionIndicatorController.redirectView)
router.get("/indicatoranimalprod/:id/edit", animalproductionIndicatorController.editIndicator)
router.put("/indicatoranimalprod/:id/update", animalproductionIndicatorController.update, animalproductionIndicatorController.redirectView)
router.delete("/indicatoranimalprod/:id/delete", animalproductionIndicatorController.deleteIndicator, animalproductionIndicatorController.redirectView)
//#### END CRUD Routes for Animal Production Indicators ####

//#### Set up CRUD Routes to Add Production Data ####

router.get("/production/:id/livestock/new", productionController.getLivestockForm)
router.post("/production/:id/livestock/register", productionController.saveLiveStock, productionController.redirectView)
router.delete("/production/:id1/:id2/delete", productionController.delete, productionController.redirectView)
router.get("/production/:id/livestock/view", productionController.index, productionController.indexView)
// router.get("/production/:id1/:id2/editproductiondata", productionController.editProductionData)
router.get("/production/:id/livestock/edit", productionController.edit)
router.get("/production/:id1/:id2/livestock/edit", productionController.editdata)
router.put("/production/:id1/:id2/update", productionController.update, productionController.redirectView)
router.get("/graphsapi/:id", productionController.chartApi)
router.get("/chart", productionController.showChart)

// #### END Production Routes ####

//#### Set up Analytics on Production Data ####
//router.post("/production/:id/analytics", productionController.analytics, productionController.redirectView)
router.post("/production/:id/analytics", productionController.analytics)
router.post("/production/analytics", productionController.analyticsView)

// #### END Analytics on Production Data ####

//#### Set up CRUD Routes to Add Animal Production Data ####
router.get("/production/:id/animalslaughtered/new", slaughterController.getSlaughterForm)
router.post("/production/:id/animalslaughtered/register", slaughterController.save, slaughterController.redirectView)
router.delete("/production/:id/deleteanimalslaughtered", slaughterController.deleteSlaughter, slaughterController.redirectView)
router.get("/production/:id/animalslaughtered/view", slaughterController.index, slaughterController.indexView)
router.get("/production/:id1/:id2/editanimalslaughtered/", slaughterController.editSlaughterData)
router.put("/production/:id1/:id2/updateanimalslaughtered/", slaughterController.update, slaughterController.redirectView)
//router.get("/graphsapi/:id", productionController.chartApi)


// #### ANALYTICS ROUTES ####
router.get("/dashboard/:id", dashboardController.showProdDashboard)
router.get("/dashboard/livestockanalytics/:id", dashboardController.showProdAnalytics)

// #### END ANALYTICS ROUTES ####
// Set up GET Routes Dashboard Routes
router.get("/dashboard", memberStateController.showDashboard, memberStateController.showDashboardView)


//Set up Errors Routes
app.use(errorController.pageNotFound)

const server = app.listen(app.get("port"), ()=> {
	console.log(`AIMS App is running on port
	${app.get("port")}`)

})



