const { processMessage } = require('./functions');

//paybill_number
let message = "DT85TH896 Confirmed. on 7/5/24 at 12.00 PM Ksh100.00 received from John Doe 0712345678 Account Number 123456 New Utility balance";
//personal_number
let message2 = "DT85TH896 Confirmed. You have received Ksh100.00 from John Doe 0712345678 on 7/5/24 at 12.00 PM New M-PESA balance";
//pochi_number
let message8 = "DT85TH896 Confirmed.You have received Ksh100.00 from John Doe on 7/5/24 at 12.00 PM New business balance"
//sent_paybill_confirmation
let message6 = "DT85TH896 Confirmed. Ksh100.00 sent to John Doe for account 0712345678 on 7/5/24 at 12.00 PM New M-PESA balance"
//sent_number_confirmation
let message3 = "DT85TH896 Confirmed. Ksh100.00 sent to John Doe 0712345678 on 7/5/24 at 12.00 PM New M-PESA";
//sent_pochi_confirmation
let message4 = "DT85TH896 Confirmed. Ksh100.00 sent to John Doe on 7/5/24 at 12.00 PM.New M-PESA";
//sent_tillno_confirmation
let message7 = "DT85TH896 Confirmed. Ksh100.00 paid to John Doe on 7/5/24 at 12.00 PM New M-PESA balance"

//let message5 = "DT85TH896 Confirmed. You have received Ksh3,500.00 from 501901 - KCB Money Transfer Services on 31/7/13 at 6:43 PM New M-PESA balance is Ksh11,312.00.Save & get a loan on Mshwari";

let member = "Name: John Doe\n" +
    "Phone: 0712345678\n";

// Response for message
let response = `Your payment of Ksh. 100.00 was Successful. 

Transaction ID: DT85TH896 
Name: John Doe 
Date: 7/5/24 12.00 PM 
Account: 123456 0712345678 
Amount: 100.00 

Thank you.`;

let response2 = `Your payment of Ksh. 100.00 was Successful. 

Transaction ID: DT85TH896 
Name: John Doe 
Date: 7/5/24 12.00 PM 
Account: 0712345678 
Amount: 100.00 

Thank you.`;

let response3 = `Your payment of Ksh. 100.00 was Successful. 

Transaction ID: DT85TH896 
Name: John Doe 
Date: 7/5/24 12.00 PM 
Account: 0712345678 
Amount: 100.00 

Thank you.`;

let response4 = `Your payment of Ksh. 100.00 was Successful. 

Transaction ID: DT85TH896 
Name: John Doe 
Date: 7/5/24 12.00 PM 
Account:  
Amount: 100.00 

Thank you.` ;

let response5 = `Your payment of Ksh. 3,500.00 was Successful. 

Transaction ID: DT85TH896 
Name: 501901 - KCB Money Transfer Services 
Date: 31/7/13 6:43 PM 
Account:   
Amount: 3,500.00 

Thank you.`;

let response6 = `Your payment of Ksh. 100.00 was Successful. 

Transaction ID: DT85TH896 
Name: John Doe 
Date: 7/5/24 12.00 PM 
Account: 0712345678 
Amount: 100.00 

Thank you.`;

let response7 = `Your payment of Ksh. 100.00 was Successful. 

Transaction ID: DT85TH896 
Name: John Doe 
Date: 7/5/24 12.00 PM 
Account:  
Amount: 100.00 

Thank you.`;

let response8 = `Your payment of Ksh. 100.00 was Successful. 

Transaction ID: DT85TH896 
Name: John Doe 
Date: 7/5/24 12.00 PM 
Account:  
Amount: 100.00 

Thank you.`;



describe("functions", () => {

     
    test(message, async () => {
        expect(await processMessage(message)).toBe(response);
    });

    test(message2, async () => {
        expect(await processMessage(message2)).toBe(response2);
    });

    test(message3, async () => {
        expect(await processMessage(message3)).toBe(response3);
    });

    test(message4, async () => {
        expect(await processMessage(message4)).toBe(response4);
    });

    /*
    test(message5, async () => {
        console.log(await processMessage(message5));
        expect(await processMessage(message5)).toBe(response5);
    });*/

    test(message6, async () => {
        expect(await processMessage(message6)).toBe(response6);
    });

    test(message7, async () => {
        expect(await processMessage(message7)).toBe(response7);
    });

    test(message8, async () => {
        expect(await processMessage(message8)).toBe(response8);
    });

    test(member, async () => {
        console.log(await processMessage(member));
        expect(true).toBe(true);
    });



});