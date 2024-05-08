const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { processMessage, processEvents} = require('./functions');


const wwebVersion = '2.2412.54'; // WhatsApp Web version to use

const client = new Client({
    auth: new LocalAuth(),
    puppeteer: {
        // puppeteer args here
    },
    // locking the wweb version
    webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    },
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', (session) => {
    console.log('Authenticated');
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {
    await client.sendSeen(msg.from);

    (async () => {
        await processEvents();
    })();

    if (msg.from.endsWith('@g.us') && msg.author === 'Test Group') {

        (async () => {
            let response = await processMessage(msg.body);

            if (response) {
                await sendMessage(response);
            }
        })();

    }
});

client.initialize();

client.on('disconnected', (reason) => {
    console.log('Client was logged out or disconnected, reason:', reason);
    // Restart code
});





// Function to send a message to a specific number
async function sendMessage(number, message) {
    try {
        // Wait for the client to be ready
        await client.waitForConnect();
        // Send the message
        await client.sendMessage(number, message);
        console.log('Message sent successfully!');
    } catch (error) {
        console.error('Error occurred while sending message:', error);
    }
}



