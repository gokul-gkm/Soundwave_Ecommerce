const nodemailer = require('nodemailer');

const sendEmail = async (name, email, otp) => {
    try {
      const transport = nodemailer.createTransport({
        service: "gmail",
  
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const mailoption = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "for verification mail",
        html: `<h1>hi ${name} this is the soundwave verification otp <br><br> <a  style='color='blue'; href=''>${otp}</a></h1>`,
      };
      transport.sendMail(mailoption, (err, info) => {
        if (err) {
          console.log(err.message);
        } else {
          console.log(`Email has been sent: ${info.messageId}`);
          console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
      });
    } catch (error) {
      console.log(error.message);
    }
};
  
module.exports = sendEmail;