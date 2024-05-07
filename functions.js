const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');

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

                // convert amount from Ksh. 1,000 to 1000
                fields.amount = fields.amount.replace(/[^0-9.-]+/g, "");

                // Save parsed messages into separate CSV files based on their slug
                saveToCSV(fields, `${PAYMENTS_DIRECTORY}${format.slug}-${year}-${month}.csv`);

                return { slug: format.slug, fields: fields };
            }
        }
    } else if (message.includes('Name:') && message.includes('Phone:')) {

        const member_path = 'data/members.csv';

        let name = message.match(/Name: (.*)/)[1].trim();
        let phone = message.match(/Phone: (.*)/)[1].trim();

        let data = new Date();
        let year = data.getFullYear();
        let month = data.getMonth() + 1;
        let day = data.getDate();


        checkPhoneNumberExists(member_path, phone)
            .then(exists => {
                if (!exists) {

                    getNextMemberNumber(member_path)
                        .then(nextMemberNo => {

                            const fields = {
                                'member_no': nextMemberNo, 
                                'name': name,
                                'phone': '0723232323',
                                'date': `${year}-${month}-${day}`
                            };

                            saveToCSV(fields, member_path);
                        });

                }
            })
            .catch(error => {
                console.error('Error occurred:', error);
            });

    }
    return null;
}



// Function to get the next member_no
function getNextMemberNumber(filePath) {
    return new Promise((resolve, reject) => {
        let highestMemberNo = 0;
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                const memberNo = parseInt(data.member_no);
                if (memberNo > highestMemberNo) {
                    highestMemberNo = memberNo;
                }
            })
            .on('end', () => {
                // Increment the highest member_no to get the next available number
                const nextMemberNo = highestMemberNo + 1;
                resolve(nextMemberNo);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Function to check if a phone number exists in the CSV file
function checkPhoneNumberExists(filePath, phoneNumber) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                // Check if the phone number exists in the CSV data
                const phoneNumberExists = results.some(record => record.phone === phoneNumber);
                resolve(phoneNumberExists);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}


module.exports = {
    processMessage,
    saveToCSV,
    messageParser,
};
