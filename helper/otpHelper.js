const nodemailer=require('nodemailer');

function generateSixDigitNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.otpemail, 
      pass: process.env.otppassword, 
  },
});

 
const sendOtp = async (req, res) => {

  try {      


    const otp = generateSixDigitNumber();
    req.session.otpExpiry = Date.now()+30*1000
    
    // console.log(otp, "OTP generated");
    const userEmail = req.body.email;
  
    req.session.userEmail = userEmail
    // console.log(userEmail+" otp sending to this email");

    if (!userEmail) {
      
      return res
        .status(400)
        .json({ error: "Invalid or missing email address" });
    }

    const mailOptions = {
      from: "sreyassree3333@gmail.com",
      to: userEmail,
      subject: "Your OTP Verification code",
      text: `Your OTP is ${otp}`,
    };

 
    
    transporter.sendMail(mailOptions, (error) => {
      // console.log("1st")
      if (error) {
        
        console.log(error);
        return res.status(500).json({ error: "Error sending OTP email" }); 
      }
      // console.log("otp sended to the user email");
    });
      
    req.session.otp = otp;
    res.json({ success:true,message: "OTP Sent To Your Email ! Check it " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const verify =  async (req, res) => {
  
    const sendedOtp = req.session.otp;
    const verifyOtp = req.body.otp;
    console.log(sendedOtp);
    console.log(verifyOtp);    
    console.log("started checking");

    if (sendedOtp === verifyOtp) {

      if(Date.now() < req.session.otpExpiry){
        console.log("otp Entered before time expires")
      req.session.otpmatched = true;
      res.json({ status: true, message: "otp verified" });
      }else{
        console.log("failed otp verification")
        req.session.otpmatched = false;
        res.json({ status: false, message: "failed" });
      }
    
    } else {
      console.log("verification fails")
      req.session.otpmatched = false;
      res.json({ status: false, message: "failed" });
    }
  };



  const otpHelper = {
       sendOtp,
       verify
  }

  module.exports= otpHelper