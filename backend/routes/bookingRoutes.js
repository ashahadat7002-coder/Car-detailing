const express= require('express');
const router = express.Router();
const Booking  = require('../models/Booking');

router.post('/',async(req,res)=>{
    try{
        const newBooking = new Booking(req.body);
        const savedBooking = await newBooking.save();

        res.status(201).json({
            success:true,
            message:'Booking created successfully!',
            data:savedBooking
        });
    }catch(error){
        console.error("BACKEND BOOKING ERROR:",error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
});
router.get('/',async(req,res)=>{
    try{
        const bookings = (await Booking.find()).Sort({createdAt:-1});
        res.status(200).json({success:true,data:bookings});
    }catch(error){
        res.status(500).json({success:false,error:error.message});
    }
});
module.exports=router;