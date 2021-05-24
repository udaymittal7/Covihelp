const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const selectFields = '_id make seats bodytype numberplate colour costperhour fueltype location currentbooking image';

const Booking = require('../models/bookings');

// with jwt guarding

//  @route    Post /api/bookings/
// @desc     create booking  for customers
// @access   Private
router.post('/',auth,(req,res)=>{
    // jwt authenticaiton
        const decoded = await User.findById(req.user.id)
        if (!decoded) return res.status(404).json({ msg: "User not found" });

        
        // obtaining form values
        const pickupTime = localiseTimeZone(new Date(req.body.pickupTime));
        const returnTime = localiseTimeZone(new Date(req.body.returnTime));

        // make current time as user's booking time
        const bookedTime = localiseTimeZone(new Date());

        // calculate time difference between return and pickup time
        const timeDeltaHours = new Date(returnTime - pickupTime).getTime() / 3600;

        // look for requested car for booking
        Car.findById(req.body.car)
            .then(car => {
                // calculate booking cost
                const cost = parseInt(car.costperhour) * (timeDeltaHours / 1000);
                // create new booking object
                const booking = new Booking({
                    _id: new mongoose.Types.ObjectId(),
                    user: req.body.user,
                    car: req.body.car,
                    bookedtime: bookedTime,
                    pickuptime: pickupTime,
                    returntime: returnTime,
                    location: req.body.location,
                    status: "Confirmed"
                });
                // save booking object and return in response
                booking.save().then(booking => {
                    const response = {
                        message: `Created booking of id '${booking._id}' successfully`,
                        booking: booking
                    }
                    return res.status(201).json({ response });
                }).catch(error => {
                    // return error if there's any
                    return res.status(500).json({ message: `Unable to get CREATE booking`, error: error });
                });
            }) ;

})

//  @route    GET /api/bookings/customers/all
// @desc     obtain all customer bookings
// @access   Private
router.get('/customers/all',auth,(req,res)=>{
    // jwt authenticaiton
        const decoded = await User.findById(req.user.id)
        if (!decoded) return res.status(404).json({ msg: "User not found" });

        // restrict feature to staff only
        if (decoded.usertype !== 'staff' && decoded.usertype !== 'admin') {
            return res.status(500).json({ message: `Unable to perform action, you have to be staff member!` });
        } else {
            // get all bookings from database
            Booking.find()
                .select(selectFields)
                .exec()
                .then(bookings => {
                    // wrap and return all booking objects in response
                    const response = {
                        bookings: bookings.map(booking => {
                            return {
                                id: booking._id,
                                user: booking.user,
                                car: booking.car,
                                bookedtime: booking.bookedtime,
                                pickuptime: booking.pickuptime,
                                returntime: booking.returntime,
                                cost: booking.cost,
                                location: booking.location,
                                status: booking.status
                            }
                        })
                    }
                    res.status(200).json(response);
                })
                .catch(error => {
                    // return error if there's any
                    res.status(500).json({ message: `Unable to GET all bookings`, error: error });
                });
        }

})

//  @route    GET /api/bookings/customers/all/:userId
// @desc     obtain all bookins from a particular user
// @access   Private
router.get('/customers/all/:userId',auth,(req,res)=>{
    // jwt authenticaiton
        const decoded = await User.findById(req.params.userId)
        if (!decoded) return res.status(404).json({ msg: "User not found" });

        
        // obtain user id from request parameters
        const userId = req.params.userId;

        // obtain bookings from a particular user by user id
        Booking.find({ user: userId })
            .select(selectFields)
            .exec()
            .then(bookings => {
                // wrap and return all booking objects in response
                const response = {
                    bookings: bookings.map(booking => {
                        return {
                            id: booking._id,
                            user: booking.user,
                            car: booking.car,
                            bookedtime: booking.bookedtime,
                            pickuptime: booking.pickuptime,
                            returntime: booking.returntime,
                            cost: booking.cost,
                            location: booking.location,
                            status: booking.status
                        }
                    })
                }
                res.status(200).json(response);
            })
            .catch(error => {
                // return error if there's any
                res.status(500).json({ message: `Unable to GET user's bookings`, error: error });
            });

})

//  @route    GET /api/bookings/customers/:id
// @desc     obtain all bookins from a particular user
// @access   Private
router.get('/customers/:id',auth,(req,res)=>{
    const decoded = await User.findById(req.user.id)
        if (!decoded) return res.status(404).json({ msg: "User not found" });
})



module.exports=router