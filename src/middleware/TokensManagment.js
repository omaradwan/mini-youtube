const jwt=require("jsonwebtoken");

module.exports.verifyToken=((req,res,next)=>{
    const authtoken = req.headers["Authorization"] || req.headers["authorization"];
    if (!authtoken) {
      req.isAuth=false
      return next()
    }
   const token = authtoken.split(' ')[1];
 
//    const SECRET_KEY = process.env.SECRET_KEY
  
    try{
        const curuser = jwt.verify(token,"7e3282b2d28d94b158e047e6f8d12e6b4b4708bbf973b4b1d8a1d6a1cb89c03a");
        
        req.userId = curuser.id
        req.isAuth=true
        next();
    }
    catch (err) {
        req.isAuth=false
        return next()
    }
        
})

module.exports.generateToken = async (userID) => {

    // Create a token with the user's ID
    const token = await jwt.sign( userID , "7e3282b2d28d94b158e047e6f8d12e6b4b4708bbf973b4b1d8a1d6a1cb89c03a", { expiresIn: '2h' });
    console.log(token)
    return token;
};
