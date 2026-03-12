import Orders from "../models/Order.js"

export const getOrders = async(req, res) =>{
    try {
        const order = await Orders.find({customer : req.user._id});

        if(!order)
        {
            return res.status(400).json({
                success:false,
                message : "No Order Available"
            })
        }

        res.status(201).json({
            success : true,
            message : "Fetched all Orders",
            order
        })
    } catch (error) {
        return res.status(501).json({
            success:false,
            message : error.message
        })
    }
}

export const createOrder = async(req, res) => {
    try {
        
        const{pickupLocation,dropLocation,packageDetails} = req.body

        if(!pickupLocation || !dropLocation || !packageDetails)
        {
            return res.status(400).json({
                success : false,
                message : "Fill all Details"
            })
        }

        const order = await Orders.create({
            customer : req.user._id,
            pickupLocation,
            dropLocation,
            packageDetails
        })

        res.status(200).json({
            success : true,
            message : "Order created Successfully",
            order
        })
    } catch (error) {
        res.status(501).json({
            success : false,
            message : `Error from ordercontroller ${error.message}`
        })
    }
}