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

    next();
    }
    catch(error){

        return res.status(500).json({
            success:false,
            message : error.message
        })
    }
}

// Role-based authorization middleware
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
        }
        next();
    };
};

export const verifyAdmin = (req, res, next) => {

    if(req.user.role !== "admin")
    {
        return res.status(403).json({
            success : false,
            message : "Access denied. Admin only."
        })
    }

        next();
}
