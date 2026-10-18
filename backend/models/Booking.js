const  mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerName: {type:String,required:true},
    phone:{type:String,required:true},
    email:{type:String,required:true},
    vehicleType:{
        type:String,
        enum:['Hatchback','Sedan','SUV','Luxury'],
        required:true
    },
    serviceType:{
        type: String,
        enum:  ['Exterior Wash & Wax','Interior Cleaning','Full Detail'],
        required:true

    },
    address:{
        street:{type:String,required:true},
        area:{type:String,required:true},
        pincode:{type:String,required:true}
    },
    bookingDate:{type:String,required:true},
    timeSlot:{type:String,required:true},
    totalPrice:{type:Number,required:true},
    status:{
        type:String,
        default:'Pending'
    }
},{timestamps:true});
module.exports = mongoose.model('Booking',bookingSchema);