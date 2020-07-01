"use strict"
module.exports = {
	homeController: (req, res) => {
		let name = req.params.firstname
		res.render("homeview/index", {name: name})
	}
}
