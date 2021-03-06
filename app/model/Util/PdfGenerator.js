'use strict';

var PdfPrinter = require('pdfmake');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
const { table } = require('console');

var PdfGenerator = function () { }

// Define font files
var fonts = {
    Roboto: {
        normal: path.join(__dirname, '..', 'util', '/fonts/Roboto-Regular.ttf'),
        bold: path.join(__dirname, '..', 'util', '/fonts/Roboto-Medium.ttf'),
        italics: path.join(__dirname, '..', 'util', '/fonts/Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, '..', 'util', '/fonts/Roboto-MediumItalic.ttf')
    }
};

var generatePdf = (patient, doctor, medicationMaster, medications) => {
    var printer = new PdfPrinter(fonts);

    // Build the medications array for table body
    var tableBody = [];

    // Add the header into the array
    tableBody.push([{ text: 'Drug Desc', style: 'tableHeader' }, { text: 'Strength', style: 'tableHeader' }, { text: 'Dosage', style: 'tableHeader' }, { text: 'Route', style: 'tableHeader' }, { text: 'Frequency', style: 'tableHeader' }, { text: 'Order Qty', style: 'tableHeader' }, { text: 'Duration', style: 'tableHeader' }]);

    // Add the datas into the array
    for (let index = 0; index < medications.length; index++) {
        var medication = medications[index];
        var dataElement = [medication.DRUG_ITEM_DESC, medication.DRUG_STRENGTH, medication.DRUG_DOSAGE, medication.DRUG_ROUTE,
        medication.DRUG_FREQUENCY, medication.QTY_ORDERED, medication.DURATION + " " + medication.DURATIONT];
        tableBody.push(dataElement);
    }

    console.log(tableBody)

    var docDefinition = {
        content: [
            // The Document Header
            {
                alignment: 'center',
                image: 'data:image/png;base64,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',
                width: 110,
                height: 110
            },
            {
                text: 'Jomedic Prescription Slip',
                style: 'titleDoc'
            },

            // The Order Details & Collection Details Paragraph
            {
                style: 'blockSeparateStyle',
                columns: [
                    {
                        text: [
                            { text: 'Order ID: ', bold: true }, medicationMaster.ORDER_NO,
                            { text: '\nOrder Date: ', bold: true }, moment(medicationMaster.ORDER_DATE).format("DD/MM/YYYY"),
                            { text: '\nMedication Order Type: ', bold: true }, 'Controlled',
                        ],
                    },
                    {
                        // text: [
                        //     { text: 'Collect Medication At: \n', bold: true },
                        //     { text: 'Klinik Kesihatan UTeM Kampus Induk', fontSize: 16 }, '\n',
                        //     { text: 'Jalan UTeM, Taman UTeM, 76100 Durian Tunggal, Melaka', fontSize: 11 }, '\n',
                        //     { text: '2.3104 °N, 102.3174 °E', fontSize: 10 },

                        //     { text: facility.hfc_name, fontSize: 16 }, '\n',
                        //     { text: facility.address1 + " " + facility.address2 + " " + facility.address3, fontSize: 11 }, '\n',
                        //     { text: facility.latitude + ' °N, ' + facility.longitude + ' °E', fontSize: 10 },
                        // ]
                    }
                ]
            },

            // The Patient Details
            {
                style: 'blockSeparateStyle',
                columns: [
                    {
                        text: [
                            { text: 'Patient Name: ', bold: true }, patient.name,
                            { text: '\nGender: ', bold: true }, patient.gender_cd,
                            // { text: '\nNationality: ', bold: true }, 'Malaysian',
                        ]
                    },
                    {
                        text: [
                            { text: 'D.O.B: ', bold: true }, moment(patient.DOB).format("DD/MM/YYYY"),
                            { text: '\nAge: ', bold: true }, calculateAge(patient.DOB),

                        ]
                    }

                ]
            },

            // The Medication Table
            {
                style: 'tableExample',
                table: {
                    widths: [150, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    headerRows: 1,
                    body: tableBody
                },
                layout: 'lightHorizontalLines'

            },

            // The Doctors Details
            {
                style: 'blockSeparateStyle',
                columns: [
                    {
                        // Empty Column
                    },
                    {
                        text: [
                            { text: 'Prescribed By: ', bold: true, marginTop: 10 },
                            '\n' + doctor.tenant_name,
                        ]
                    }
                ]
            },
        ],

        styles: {
            titleDoc: {
                fontSize: 22,
                bold: true,
                alignment: 'center',
                margin: 20
            },
            blockSeparateStyle: {
                margin: 10,
                columnGap: 20
            },
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            table: {
                margin: [0, 5, 0, 15]
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
            }

        },
    };

    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.end();

    return pdfDoc;
    // Direct attach file to email without save at local storage
    // var pdfDoc = printer.createPdfKitDocument(docDefinition);
    // pdfDoc.end();
}

var calculateAge = (DOB) => {
    return moment().diff(DOB, 'year')
}

PdfGenerator.generatePrescription = function (patient, doctor, medicationMaster, medications) {
    // Initialize Data
    return generatePdf(patient[0], doctor[0], medicationMaster[0], medications);
}


module.exports = PdfGenerator;
