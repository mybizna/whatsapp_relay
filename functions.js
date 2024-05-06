const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const MESSAGES_FILE_PATH = 'data/messages.csv';
const PAYMENTS_DIRECTORY = 'data/payments/';

// Create the payments directory if it doesn't exist
if (!fs.existsSync(PAYMENTS_DIRECTORY)) {
    fs.mkdirSync(PAYMENTS_DIRECTORY);
}

async function processMessage(message) {
   
    // Save messages that trigger the bot to respond into a CSV file
    await saveMessageToCSV(message, MESSAGES_FILE_PATH);
  
    // Call message parser function for eligible messages
    const parsedMessage = messageParser(message);

    console.log(parsedMessage);
    console.log('parsedMessage');

    if (parsedMessage) {
        return responseMessage(parsedMessage);
    }

    return null;
}

function responseMessage(parsedMessage) {
    const response = `Your have made a payment of Ksh. ${parsedMessage.fields.amount} was Successful. \n\n` +
        `Transaction ID: ${parsedMessage.fields.code} \n` +
        `Name: ${parsedMessage.fields.name} \n` +
        `Date: ${parsedMessage.fields.date} ${parsedMessage.fields.time} \n` +
        `Account: ${parsedMessage.fields.account} ${parsedMessage.fields.phone} \n` +
        `Amount: ${parsedMessage.fields.amount} \n\n` +
        "Thank you."

    return response;
}


function saveMessageToCSV(message, filePath) {
    const writer = csvWriter({
        path: filePath,
        header: [{ id: 'message', title: 'Message' }]
    });

    if (!fs.existsSync(filePath)) {
        writer.writeRecords([{ message: message }]);
    } else {
        writer.writeRecords([{ message: message }], { append: true });
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

        for (let format of messageFormats) {
            const match = message.match(format.format);
          
            console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
            console.log('match');
            console.log(message);
            console.log(format);
            console.log(match);

            if (match) {
                let fields = {};
                for (let i = 1; i < match.length; i++) {
                    fields[format.fields_str[i - 1]] = match[i].trim();
                }
                // Save parsed messages into separate CSV files based on their slug
                saveMessageToCSV(fields, `${PAYMENTS_DIRECTORY}${format.slug}.csv`);
                return { slug: format.slug, fields: fields };
            }
        }
    }
    return null;
}


module.exports = {
    processMessage,
    saveMessageToCSV,
    messageParser,
};
