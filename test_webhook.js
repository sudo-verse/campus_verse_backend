const crypto = require('crypto');
const axios = require('axios');

const secret = 'justfriend';
const payload = JSON.stringify({});
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

console.log(`Payload: ${payload}`);
console.log(`Signature: ${signature}`);

axios.post('http://localhost:7776/payment/webhooks', {}, {
    headers: {
        'x-razorpay-signature': signature,
        'Content-Type': 'application/json'
    }
}).then(res => {
    console.log('Status:', res.status);
    console.log('Data:', res.data);
}).catch(err => {
    if (err.response) {
        console.log('Status:', err.response.status);
        console.log('Data:', err.response.data);
    } else {
        console.log('Error:', err.message);
    }
});
