'use strict'

class PDF {
    constructor() {
        this.css = ''
        this.html = ''
    }


    setCSS(path) {
        // Absolute URL
        this.css = '<link rel="stylesheet" href="' + path + '" />'
	    console.log(this.css)
    }

    build(str) {
        this.html += `<html><head> ${this.css} </head><body><div id="pageContent">`
        this.html += str
        this.html += `</div></body></html>`
    }
}

module.exports = PDF
