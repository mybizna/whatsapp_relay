const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('qr', (qr) => {
    // Generate and display QR code
    qrcode.generate(qr, { small: true });
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
