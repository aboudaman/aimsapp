"use strict"

const httpStatusCode = require("http-status-codes")
module.exports = {

	pageNotFound: (req, res) => {

		let error = httpStatusCode.NOT_FOUND
		res.status(error)
		res.send("OOPS! Something went wrong - The page does not exist")
	}

}
