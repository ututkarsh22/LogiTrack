import jwt from "jsonwebtoken"

export const verifyToken = (req , res , next) => {
    try{
    const token = req.cookies.token;
    if(!token)
    {
        return res.status(401).json({
            success : false,
            message : "Unauthorised"
        });
    }


    const decode = jwt.verify(token,process.env.JWT_SECRET);

    req.user = decode;
    console.log(req.user);

    next();
    }
    catch(error){

        return res.status(501).json({
            success:false,
            message : error.message
        })
    }
}