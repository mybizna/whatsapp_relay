const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');

const MESSAGES_DIRECTORY = 'data/messages/';
const PAYMENTS_DIRECTORY = 'data/payments/';
const PLEDGES_DIRECTORY = 'data/pledges/';

// Create the payments directory if it doesn't exist
if (!fs.existsSync(PAYMENTS_DIRECTORY)) {
    fs.mkdirSync(PAYMENTS_DIRECTORY);
}
// Create the Messages directory if it doesn't exist
if (!fs.existsSync(MESSAGES_DIRECTORY)) {
    fs.mkdirSync(MESSAGES_DIRECTORY);
}

// Create the Pledges directory if it doesn't exist
if (!fs.existsSync(PLEDGES_DIRECTORY)) {
    fs.mkdirSync(PLEDGES_DIRECTORY);
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
    const parsedMessage = await messageParser(message);

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

    let response = '';

    switch (parsedMessage.slug) {
        case 'member':
            if (parsedMessage.status === 'new') {
                response = `Member Sucessfully added: \n\n` +
                    `Member No: ${parsedMessage.fields.member_no} ` + "\n\n" +
                    `Name: ${parsedMessage.fields.name} ` + "\n" +
                    `Phone: ${parsedMessage.fields.phone} ` + "\n" +
                    `Date: ${parsedMessage.fields.date} ` + "\n" +
                    `Status: ${parsedMessage.status} ` + "\n\n" +
                    "Thank you.";
            } else {
                response = `Member already exists: \n\n` +
                    `Name: ${parsedMessage.fields.name} ` + "\n" +
                    `Phone: ${parsedMessage.fields.phone} ` + "\n" +
                    `Status: ${parsedMessage.status} ` + "\n\n" +
                    "Thank you.";
            }
            break;
        case 'paybill_number':
        case 'personal_number':
        case 'pochi_number':
        case 'sent_paybill_confirmation':
        case 'sent_number_confirmation':
        case 'sent_pochi_confirmation':
        case 'sent_tillno_confirmation':

            let account = '';

            if (parsedMessage.fields.account && parsedMessage.fields.phone) {
                account = `${parsedMessage.fields.account} ${parsedMessage.fields.phone}`;
            } else if (parsedMessage.fields.account) {
                account = parsedMessage.fields.account;
            } else if (parsedMessage.fields.phone) {
                account = parsedMessage.fields.phone;
            }

            if (parsedMessage.status === 'new') {
                response = `Your payment of Ksh. ${parsedMessage.fields.amount} was Successful. ` + "\n\n" +
                    `Transaction ID: ${parsedMessage.fields.code} ` + "\n" +
                    `Name: ${parsedMessage.fields.name} ` + "\n" +
                    `Date: ${parsedMessage.fields.date} ${parsedMessage.fields.time} ` + "\n" +
                    `Account: ${account} ` + "\n" +
                    `Amount: ${parsedMessage.fields.amount} ` + "\n\n" +
                    "Thank you.";
            } else {
                response = `Your payment with code ${parsedMessage.fields.code} Already Exist. ` + "\n\n" +
                    `Transaction ID: ${parsedMessage.fields.code} ` + "\n" +
                    `Name: ${parsedMessage.fields.name} ` + "\n" +
                    `Date: ${parsedMessage.fields.date} ${parsedMessage.fields.time} ` + "\n" +
                    `Account: ${account} ` + "\n" +
                    `Amount: ${parsedMessage.fields.amount} ` + "\n\n" +
                    "Thank you.";
            }


            return response;
    }
}

async function saveToCSV(fields, filePath) {

    const writer = csvWriter({
        append: true,
        path: filePath,
        header: Object.keys(fields).map(key => ({ id: key, title: key })) // Create headers from object keys
    });

    const records = [fields];

    // Check if the file exists
    if (!fs.existsSync(filePath)) {

        // Create headers from object keys
        headers = {};
        Object.keys(fields).forEach(key => {
            headers[key] = key;
        });

        // append the headers to the records at the top
        records.unshift(headers);
    }

    await writer.writeRecords(records);
}


// Message parser function
async function messageParser(message) {
    if (message.includes('@bot') || message.includes('/bot') || message.includes('M-PESA') || message.includes('Confirmed.') || message.includes('Utility balance')) {
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
                "slug": "pochi_number",
                "format": "(.*) Confirmed.You have received (.*) from (.*) on (.*) at (.*) New business",
                "fields_str": ['code', 'amount', 'name', 'date', 'time'],
            },
            {
                "slug": "sent_paybill_confirmation",
                "format": "(.*) Confirmed.(.*) sent to (.*) for account (.*) on (.*) at (.*) New M-PESA",
                "fields_str": ['code', 'amount', 'name', 'account', 'date', 'time'],
            },
            {
                "slug": "sent_number_confirmation",
                "format": "(.*) Confirmed.(.*) sent to (.*) (.*) on (.*) at (.*). New M-PESA",
                "fields_str": ['code', 'amount', 'name', 'phone', 'date', 'time'],
            },
            {
                "slug": "sent_pochi_confirmation",
                "format": "(.*) Confirmed.(.*) sent to (.*) on (.*) at (.*).New M-PESA",
                "fields_str": ['code', 'amount', 'name', 'date', 'time'],
            },
            {
                "slug": "sent_tillno_confirmation",
                "format": "(.*) Confirmed.(.*) paid to (.*) on (.*) at (.*).New M-PESA",
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

                // Check if last character for time is M and add it if not
                if (fields.time.charAt(fields.time.length - 1) !== 'M') {
                    fields.time += 'M';
                }

                let status = 'exist';
                let payment_path = `${PAYMENTS_DIRECTORY}${format.slug}-${year}-${month}.csv`;

                if (fs.existsSync(payment_path)) {
                    await checkFieldExists(payment_path, 'code', fields.code)
                        .then(async exists => {
                            if (!exists) {
                                // Save parsed messages into separate CSV files based on their slug
                                saveToCSV(fields, payment_path);
                                status = 'new';
                            }

                        })
                        .catch(error => {
                            console.error('Error occurred:', error);
                        });
                } else {
                    status = 'new';
                    saveToCSV(fields, payment_path);
                }

                return { slug: format.slug, fields: fields, status: status };
            }
        }
    } else if (message.includes('Name:') && message.includes('Phone:')) {

        const member_path = 'data/members.csv';

        let name = message.match(/Name: (.*)/)[1].trim();
        let phone = message.match(/Phone: (.*)/)[1].trim();

        let data = new Date();
        let year = data.getFullYear();
        let month = (data.getMonth() + 1).toString().padStart(2, '0');
        let day = data.getDate().toString().padStart(2, '0');

        return await checkFieldExists(member_path, 'phone', phone)
            .then(async exists => {
                let status = 'exist';
                let member = { 'name': name, 'phone': phone, };

                if (!exists) {
                    member = await getNextMemberNumber(member_path)
                        .then(nextMemberNo => {

                            status = 'new';

                            const fields = {
                                'member_no': nextMemberNo.toString().padStart(3, '0'),
                                'name': name,
                                'phone': phone,
                                'date': `${year}-${month}-${day}`
                            };

                            saveToCSV(fields, member_path);

                            return fields;
                        });


                }
                return { slug: 'member', fields: member, status: status };
            })
            .catch(error => {
                console.error('Error occurred:', error);
            });

    }
    return null;
}

// Function to get the next member_no
async function getNextMemberNumber(filePath) {
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

// Function to check if a field exists with a specific value in the CSV file
function checkFieldExists(filePath, fieldName, value) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                // Check if the field exists with the specified value in the CSV data
                const fieldExists = results.some(record => record[fieldName] === value);
                resolve(fieldExists);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Function to search for a field and return its value if found, or null otherwise
function searchField(filePath, fieldName, searchValue) {
    return new Promise((resolve, reject) => {
        let fieldValue = null;
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Check if the current record matches the search criteria
                if (data[fieldName] === searchValue) {
                    fieldValue = data[fieldName];
                }
            })
            .on('end', () => {
                resolve(fieldValue);
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
