const PDFDocument = require('pdfkit')

exports.generatePDF = ()=>{

    const doc = new PDFDocument()

    doc.text('INSPECT CONTAINER REPORT')

    doc.end()
}