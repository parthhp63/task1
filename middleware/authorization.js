const dotenv=require("dotenv");
const jwt=require("jsonwebtoken");

dotenv.config();

exports.authorization=(req,res,next)=>{
    const token=req.cookies.access_token;
    console.log(token);
    if(!token){
        console.log('Has not Token');
        res.redirect("/login")
    }
    else{
        try{
            console.log('Has token');
            const data=jwt.verify(token,"hi");
            req.email=data.email;

            return next();
        }
        catch{
             return  res.sendStatus(403);
        }
    }
}