const multer = require("multer")

module.exports = {

	upload: multer({

		limits: {
			fileSize: 4 * 1024 * 1024
		}

	})
}
