import nodemailer from 'nodemailer'
console.log({
    host: process.env.NODE_CODE_HOST,
    port: process.env.NODE_CODE_HOST_PORT,
    user: process.env.NODE_CODE_SENDING_USER,
    pass: process.env.NODE_CODE_SENDING_PASSWORD
});


var transport = nodemailer.createTransport({
  host: process.env.NODE_CODE_HOST,
  port: process.env.NODE_CODE_HOST_PORT,
  auth: {
    user: process.env.NODE_CODE_SENDING_USER,
    pass: process.env.NODE_CODE_SENDING_PASSWORD
  }
});

export default transport