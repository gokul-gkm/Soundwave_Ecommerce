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
        subject: "Your SoundWave Verification Code",
        html: `
  <div style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
    
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          
          <table width="500px" style="background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Logo / Brand -->
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h2 style="margin:0; color:#333;">🎧 SoundWave</h2>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td align="center">
                <h3 style="color:#333; margin-bottom:10px;">Verify Your Email</h3>
                <p style="color:#777; font-size:14px;">
                  Hi <b>${name}</b>, use the OTP below to complete your verification.
                </p>
              </td>
            </tr>

            <!-- OTP Box -->
            <tr>
              <td align="center" style="padding: 25px 0;">
                <div style="
                  display:inline-block;
                  background:#f1f3f6;
                  padding:15px 30px;
                  font-size:28px;
                  letter-spacing:6px;
                  font-weight:bold;
                  color:#333;
                  border-radius:8px;
                  border:1px dashed #ccc;
                ">
                  ${otp}
                </div>
              </td>
            </tr>

            <!-- Info -->
            <tr>
              <td align="center">
                <p style="color:#555; font-size:13px;">
                  This OTP is valid for <b>5 minutes</b>. Do not share it with anyone.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:20px 0;">
                <hr style="border:none; border-top:1px solid #eee;">
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center">
                <p style="font-size:12px; color:#999;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
                <p style="font-size:12px; color:#bbb; margin-top:10px;">
                  © ${new Date().getFullYear()} SoundWave. All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
`
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