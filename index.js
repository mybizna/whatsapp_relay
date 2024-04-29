const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
    const operatingSystems = [
      {
        platform: "linux",
        version: 818858,
      },
      // "mac",
      {
        platform: "win64",
        version: 555668,
      },
    ];
    operatingSystems.forEach(async (os) => {
      const f = puppeteer.createBrowserFetcher({
        platform: os.platform,
        path: path.join(__dirname, "dist", "puppeteer"),
      });
      await f.download(os.version);
    });
  })();

const sessionData = require('./session.json');

const client = new Client({
    session: sessionData,
    webVersionCache: {
        type: "remote",
        remotePath:
            "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
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
    if (msg.body === 'ping') {
        // Reply to 'ping' message
        await msg.reply('pong');
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

// Example usage:
// Replace 'XXXXXXXXXXXX' with the recipient's phone number in international format (e.g., '+1234567890')
// Replace 'Hello, world!' with the message you want to send
//sendMessage('XXXXXXXXXXXX', 'Hello, world!');
