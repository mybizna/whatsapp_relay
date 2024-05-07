const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;
//const csvWriter = require("csv-writer").createObjectCsvWriter({ append: true }) ;

const MESSAGES_DIRECTORY = 'data/messages/';
const PAYMENTS_DIRECTORY = 'data/payments/';

// Create the payments directory if it doesn't exist
if (!fs.existsSync(PAYMENTS_DIRECTORY)) {
    fs.mkdirSync(PAYMENTS_DIRECTORY);
}
// Create the Messages directory if it doesn't exist
if (!fs.existsSync(MESSAGES_DIRECTORY)) {
    fs.mkdirSync(MESSAGES_DIRECTORY);
}

var month_names = ["jan", "feb", "mar", "apr", "may", "jun",
"jul", "aug", "sep", "oct", "nov", "dec"
];

/**
 * Process incoming messages
 * @param {string} message - The incoming message
 * @returns {string} - The response message
 * @async
 * @function processMessage
 * @exports processMessage
 * 
 */
async function processMessage(message) {



    // message file to be combnation of year and month
    const date = new Date();
    const year = date.getFullYear();
    const month = month_names[date.getMonth()];

    // Save messages that trigger the bot to respond into a CSV file
    await saveToCSV({ 'message': message }, MESSAGES_DIRECTORY + '/' + year + '-' + month + '.csv');

    // Call message parser function for eligible messages
    const parsedMessage = messageParser(message);



    if (parsedMessage) {
        return responseMessage(parsedMessage);
    }

    return null;
}

/**
 * Response message
 * @param {*} parsedMessage 
 * @returns 
 */
function responseMessage(parsedMessage) {
    const response = `Your payment of Ksh. ${parsedMessage.fields.amount} was Successful. ` + "\n\n" +
        `Transaction ID: ${parsedMessage.fields.code} ` + "\n" +
        `Name: ${parsedMessage.fields.name} ` + "\n" +
        `Date: ${parsedMessage.fields.date} ${parsedMessage.fields.time} ` + "\n" +
        `Account: ${parsedMessage.fields.account} ${parsedMessage.fields.phone} ` + "\n" +
        `Amount: ${parsedMessage.fields.amount} ` + "\n\n" +
        "Thank you.";


    return response;
}

function saveToCSV(fields, filePath) {
    const writer = csvWriter({
        append: true,
        path: filePath,
        header: Object.keys(fields).map(key => ({ id: key, title: key })) // Create headers from object keys
    });

    // Extract values from the fields object
    const records = [fields];

    console.log('records');
    console.log(records);

    if (!fs.existsSync(filePath)) {
        writer.writeRecords(records);
    } else {
        writer.writeRecords(records, { append: true });
    }
}

// Message parser function
function messageParser(message) {
    if (message.includes('@bot') || message.includes('/bot') || message.includes('M-PESA') || message.includes('Utility balance')) {
        let messageFormats = [
            {
                "slug": "paybill_number",
                "format": "(.*) Confirmed. on (.*) at (.*) (.*) received from (.*) (.*) Account Number (.*) New Utility balance",
                "fields_str": ['code', 'date', 'time', 'amount', 'name', 'phone', 'account'],
            },
            {
                "slug": "personal_number",
                "format": "(.*) Confirmed. You have received (.*) from (.*) (.*) on (.*) at (.*) New M-PESA balance",
                "fields_str": ['code', 'amount', 'name', 'phone', 'date', 'time'],
            },
            {
                "slug": "sent_number_confirmation",
                "format": "(.*) Confirmed.(.*) sent to (.*) (.*) on (.*) at (.*). New M-PESA",
                "fields_str": ['code', 'amount', 'name', 'phone', 'date', 'time'],
            },
            {
                "slug": "sent_pochi_confirmation",
                "format": "(.*) Confirmed.(.*) sent to (.*) on (.*) at (.*). New M-PESA",
                "fields_str": ['code', 'amount', 'name', 'date', 'time'],
            },
            {
                "slug": "sent_tillno_confirmation",
                "format": "(.*) Confirmed.(.*) paid to (.*) on (.*) at (.*). New M-PESA",
                "fields_str": ['code', 'amount', 'name', 'date', 'time'],
            }
        ];

        const date = new Date();
        const year = date.getFullYear();
        const month = month_names[date.getMonth()];

        for (let format of messageFormats) {
            const match = message.match(format.format);

            if (match) {

                let fields = {};
                for (let i = 1; i < match.length; i++) {
                    fields[format.fields_str[i - 1]] = match[i].trim();
                }
                // Save parsed messages into separate CSV files based on their slug
                saveToCSV(fields, `${PAYMENTS_DIRECTORY}${format.slug}-${year}-${month}.csv`);

                return { slug: format.slug, fields: fields };
            }
        }
    }
    return null;
}


module.exports = {
    processMessage,
    saveToCSV,
    messageParser,
};
