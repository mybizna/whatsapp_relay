const { processMessage } = require('./functions');

let message = 'DT85TH896 Confirmed. on 2021-09-01 at 12.00PM Ksh100.00 received from John Doe 0712345678 Account Number 123456 New Utility balance';
let message2 = 'DT85TH896 Confirmed. You have received Ksh 100 from John Doe 0712345678 on 2021-09-01 at 12.00PM New M-PESA balance';
let message3 = 'DT85TH896 Confirmed. Ksh 100 sent to John Doe 0712345678 on 2021-09-01 at 12.00PM. New M-PESA';
let message4 = 'DT85TH896 Confirmed. Ksh 100 sent to 0712345678 on 2021-09-01 at 12.00PM. New M-PESA';
let message5 = 'DT85TH896 Confirmed. You have received Ksh3,500.00 from 501901 - KCB Money Transfer Services on 31/7/13 at 6:43PM New M-PESA balance is Ksh11,312.00.Save & get a loan on Mshwari';

// Response for message
let response = 'Your have made a payment of Ksh. 100 was Successful. \n\n' +
    'Transaction ID: DT85TH896 \n' +
    'Name: John Doe \n' +
    'Date: 2021-09-01 12.00 PM \n' +
    'Account: 123456 0712345678 \n' +
    'Amount: 100 \n\n' +
    'Thank you.';

let response2 = 'Your have made a payment of Ksh. 100 was Successful. \n\n' +
    'Transaction ID: DT85TH896 \n' +
    'Name: John Doe \n' +
    'Date: 2021-09-01 12.00 PM \n' +
    'Account:  0712345678 \n' +
    'Amount: 100 \n\n' +
    'Thank you.';

let response3 = 'Your have made a payment of Ksh. 100 was Successful. \n\n' +
    'Transaction ID: DT85TH896 \n' +
    'Name: John Doe \n' +
    'Date: 2021-09-01 12.00 PM \n' +
    'Account: 0712345678 \n' +
    'Amount: 100 \n\n' +
    'Thank you.';

let response4 = 'Your have made a payment of Ksh. 100 was Successful. \n\n' +
    'Transaction ID: DT85TH896 \n' +
    'Name:  \n' +
    'Date: 2021-09-01 12.00 PM \n' +
    'Account:  \n' +
    'Amount: 100 \n\n' +
    'Thank you.';

let response5 = 'Your have made a payment of Ksh. 3,500.00 was Successful. \n\n' +
    'Transaction ID: DT85TH896 \n' +
    'Name: 501901 - KCB Money Transfer Services \n' +
    'Date: 31/7/13 6:43 PM \n' +
    'Account:  \n' +
    'Amount: 3,500.00 \n\n' +
    'Thank you.';

describe("functions", () => {
    test(message, () => {
        expect(processMessage(message)).toBe(response);
    });
/*
    test(message2, () => {
        expect(processMessage(message2)).toBe(response2);
    });

    test(message3, () => {
        expect(processMessage(message3)).toBe(response3);
    });

    test(message4, () => {
        expect(processMessage(message4)).toBe(response4);
    });

    test(message5, () => {
        expect(processMessage(message5)).toBe(response5);
    });*/

});