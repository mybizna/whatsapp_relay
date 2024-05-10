const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');

const MESSAGES_DIRECTORY = 'data/messages/';
const PAYMENTS_DIRECTORY = 'data/payments/';
const FUNDS_DIRECTORY = 'data/funds/';

// Create the payments directory if it doesn't exist
if (!fs.existsSync(PAYMENTS_DIRECTORY)) {
    fs.mkdirSync(PAYMENTS_DIRECTORY);
}
// Create the Messages directory if it doesn't exist
if (!fs.existsSync(MESSAGES_DIRECTORY)) {
    fs.mkdirSync(MESSAGES_DIRECTORY);
}

// Create the Funds directory if it doesn't exist
if (!fs.existsSync(FUNDS_DIRECTORY)) {
    fs.mkdirSync(FUNDS_DIRECTORY);
}

var month_names = ["jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
];

// Function to process events from the CSV file
async function processEvents() {
    await fs.createReadStream('data/funds.csv')
        .pipe(csv())
        .on('data', async (row) => {

            // Extract the "slug" value from the row
            const slug = row.slug;

            let fund_path = FUNDS_DIRECTORY + '/' + slug + '.csv'

            // Check if the file exists
            if (!fs.existsSync(fund_path)) {
                let rows = [];
                // Get all members from data/members.csv and add them to the fund file
                await fs.createReadStream('data/members.csv')
                    .pipe(csv())
                    .on('data', async (member) => {
                        let pledge = (row.default_pledge) ? row.default_pledge : 0;
                        rows.push({ 'member_no': member.member_no, 'amount': 0, 'pledge': pledge });
                    }
                    )
                    .on('end', async () => {
                        // Save messages that trigger the bot to respond into a CSV file
                        await saveToCSV(rows, fund_path, true);
                        console.log('All members processed successfully.');
                    })
                    .on('error', (error) => {
                        console.error('Error processing members:', error);
                    });
            }
        })
        .on('end', () => {
            console.log('All events processed successfully.');
        })
        .on('error', (error) => {
            console.error('Error processing events:', error);
        });
}

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
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');

    let hour = date.getHours().toString().padStart(2, '0');
    let minute = date.getMinutes().toString().padStart(2, '0');
    let second = date.getSeconds().toString().padStart(2, '0');

    const month_str = month_names[date.getMonth()];

    let message_obj = { 'message': message, 'created_at': `${year}-${month}-${day} ${hour}:${minute}:${second}` };

    // Save messages that trigger the bot to respond into a CSV file
    await saveToCSV(message_obj, MESSAGES_DIRECTORY + '/' + year + '-' + month_str + '.csv');

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
            break;
        case 'pledge':
            if (parsedMessage.status === 'new') {
                response = `Pledge Sucessfully added: \n\n` +
                    `Member No: ${parsedMessage.fields.member_no} ` + "\n" +
                    `Fund: ${parsedMessage.fields.fund} ` + "\n" +
                    `Pledge: ${parsedMessage.fields.pledge} ` + "\n" +
                    `Status: ${parsedMessage.status} ` + "\n\n" +
                    "Thank you.";
            } else if (parsedMessage.status === 'rejected') {
                response = `Pledge rejected because pledge submitted is less than current pledge: \n\n` +
                    `Member No: ${parsedMessage.fields.member_no} ` + "\n" +
                    `Fund: ${parsedMessage.fields.fund} ` + "\n" +
                    `Pledge: ${parsedMessage.fields.pledge} ` + "\n" +
                    `Status: ${parsedMessage.status} ` + "\n\n" +
                    "Contact Admin for Assistance.";
            } else {
                response = `Pledge Already Exist: \n\n` +
                    `Member No: ${parsedMessage.fields.member_no} ` + "\n" +
                    `Fund: ${parsedMessage.fields.fund} ` + "\n" +
                    `Pledge: ${parsedMessage.fields.pledge} ` + "\n" +
                    `Status: ${parsedMessage.status} ` + "\n\n" +
                    "Thank you.";
            }
            break;

        }



        return response;
}

async function saveToCSV(fields, filePath, append = true) {

    let header = {};
    let records = [];

    // Check if the file exists and set append to false if it doesn't
    if (!fs.existsSync(filePath)) {
        append = false;
    }

    // check if fields is an array or object and process header accordingly
    if (Array.isArray(fields)) {
        header = Object.keys(fields[0]).map(key => ({ id: key, title: key }));
        records = fields;
    } else if (typeof fields === 'object') {
        header = Object.keys(fields).map(key => ({ id: key, title: key }));
        records = [fields];
    }

    const writer = csvWriter({
        append: append,
        path: filePath,
        header: header  // Create headers from object keys
    });

    // Check if the file exists
    if (!fs.existsSync(filePath) || !append) {

        // Check if fields is not empty
        if (records.length !== 0) {

            // Create headers from object keys
            let headers = {};
            Object.keys(records[0]).forEach(key => {
                headers[key] = key;
            });

            // append the headers to the records at the top
            //records.unshift(headers);
        }
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
    } else if (message.includes('MemberNo:') && message.includes('Pledge:')) {

        console.log("MemberNo:Pledge:");

        let member_no = message.match(/MemberNo: (.*)/)[1].trim();
        let pledge = message.match(/Pledge: (.*)/)[1].trim();
        let fund = message.match(/Fund: (.*)/)[1].trim();

        // Search for record in funds file data/funds/${fund}.csv and add if not exist and update the pledge field if exist
        let fund_path = `data/funds/${fund}.csv`;
        console.log(fund_path);

        let newData = { 'member_no': member_no, 'amount': 0, 'pledge': pledge }

        return await modifyCSVRecord(fund_path, 'pledge', 'member_no', member_no, newData)
            .then(async item => {
                return item;
            })
            .catch(error => {
                console.error('Error occurred:', error);
            });

    } else if (message.includes('MemberNo:') && message.includes('Code:')) {

        console.log("MemberNo:Code:");

        let member_no = message.match(/MemberNo: (.*)/)[1].trim();
        let code = message.match(/Code: (.*)/)[1].trim();
        let fund = message.match(/Fund: (.*)/)[1].trim();

        let date = new Date();
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');

        // search for code in data/payments/paybill_number-${year}-${month}.csv, data/payments/pochi_number-${year}-${month}.csv and data/payments/personal_number-${year}-${month}.csv
        let files = [`paybill_number-${year}-${month}.csv`, `pochi_number-${year}-${month}.csv`, `personal_number-${year}-${month}.csv`];
        let payment = null;

        for (let file of files) {
            let payment_path = `${PAYMENTS_DIRECTORY}${file}`;

            if (fs.existsSync(payment_path)) {
                await searchField(payment_path, 'code', code)
                    .then(async record => {
                        if (exists) {
                            payment = record;
                        }
                    })
                    .catch(error => {
                        console.error('Error occurred:', error);
                    });
            }

        }

        if (payment) {
            let amount = payment.amount;

            saveToCSV(payment, `data/payments.csv`);

            let fund_path = `data/funds/${fund}.csv`;

            let newData = { 'member_no': member_no, 'amount': amount, 'pledge': 0 }

            return await modifyCSVRecord(fund_path, 'payment', 'member_no', member_no, newData)
                .then(async item => {
                    return item;
                })
                .catch(error => {
                    console.error('Error occurred:', error);
                });
        }


    } else if (message.includes('Name:') && message.includes('Phone:')) {

        const member_path = 'data/members.csv';

        let name = message.match(/Name: (.*)/)[1].trim();
        let phone = message.match(/Phone: (.*)/)[1].trim();

        let date = new Date();
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');

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

// Function to update a CSV record
function modifyCSVRecord(csvFilePath, slug, searchField, searchValue, newData) {
    return new Promise((resolve, reject) => {
        let updated = false;
        let rows = [];
        let status = 'exist';

        // Read the CSV file and update the record
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {

                // If the row key is equal to it value skip
                if (row['member_no'] === 'member_no') {
                    return;
                }

                if (row[searchField]) {
                    if (row[searchField] === searchValue) {
                        status = 'new';

                        if (slug === 'payment') {
                            if (row['amount'] > 0) {
                                newData['amount'] = row['amount'] + newData['amount'];
                            }
                            if (row['pledge'] > 0) {
                                newData['pledge'] = row['pledge'] - newData['amount'];
                            }
                        }

                        if (slug === 'pledge') {
                            if (row['amount'] > 0) {
                                newData['amount'] = row['amount'];
                            }

                            if (newData['pledge'] < row['pledge']) {
                                newData['pledge'] = row['pledge'];
                                status = 'rejected';
                            }
                        }

                        updated = true;

                        rows.push(newData);
                    } else {
                        rows.push(row);
                    }
                }

            })
            .on('end', async () => {


                if (!updated) {
                    rows.push(newData);
                }

                await saveToCSV(rows, csvFilePath, false);

                resolve({ slug: slug, data: newData, status: status });
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
                    resolve(data);
                }
            })
            .on('end', () => {
                resolve(false);
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
    processEvents,
};
