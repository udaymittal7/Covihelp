const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bookingSelectFields = '_id user car bookedtime pickuptime returntime cost location status';
const selectFields = '_id make seats bodytype numberplate colour costperhour fueltype location currentbooking image';

const User = require('../models/user');
const Ambulance=require('../models/ambulance')

// without jwt

//  @route    GET api/ambulance/
// @desc     Get all ambulance
// @access   Public
router.get('/',(req,res)=>{
 // get all cars from database
    Ambulance.find()
        .select(selectFields)
        .exec()
        .then(cars => {
            // wrap and return ambulance objects in response
            const response = {
                cars: cars.map(car => {
                    return {
                        id: car._id,
                        numberplate: car.numberplate,
                        location: car.location,
                        currentbooking: car.currentbooking
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(error => {
            // return error if there's any
            console.error(error.message);
            res.status(500).json({ message: `Unable to GET all Ambulance`});
        });

})

//  @route     GET api/ambulance/:id
// @desc     Get a particular cars
// @access   Public
router.get('/:id',(req, res, next) => {
    // obtain car id from request parameters
    const id = req.params.id;

    // get car by id from database
    Ambulance.findOne({ _id: id })
        .select(selectFields)
        .exec()
        .then(car => {
            // wrap and return car object in response
            const response = {
                car: car
            }
            res.status(200).json(response);
        })
        .catch(error => {
            // return error if there's any
            res.status(500).json({ message: `Unable to GET car of id '${id}'`, error: error });
        });
})

//jwt authorize
//  @route     POST api/ambulance/
// @desc     create a new ambulance
// @access   Private
router.post('/',auth,[
    check("numberplate", "Please include a valid emial").exists()
  ],async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // jwt authenticaiton
        const decoded = await User.findById(req.user.id)
          if (!decoded) return res.status(404).json({ msg: "User not found" });
      // restrict feature to staff only
        if (decoded.usertype !== 'driver' && decoded.usertype !== 'admin') {
            return res.status(500).json({ message: `Unable to perform action, you have to be staff member!` });
        } else {
            // get location by car's pickup/return spot
            Location.findOne({ address: req.body.location }).then(location => {
                // create a ambulance object
                const car = new Ambulance({
                    _id: new mongoose.Types.ObjectId(),
                    numberplate: req.body.numberplate,
                    location: location,
                    image: req.body.b64photo,
                    currentbooking: null
                });
                // save ambulance object
                car.save().then(car => {
                    // add ambulance id into location's car list
                    location.cars.push(car._id);
                    location.save();
                    // wrap and return ambulance object in response
                    const response = {
                        message: `Created car of id '${car._id}' successfully`,
                        car: car
                    }
                    return res.status(201).json({ response });
                }).catch(error => {
                    // return error if there's any
                    return res.status(500).json({ message: `Unable to get CREATE car of id '${_id}'`, error: error });
                });
            });
        }
    });


//  @route    Delete api/ambulance/:id
// @desc     delete  ambulance
// @access   Private
router.delete('/:id',auth,async (req,res)=>{

     // jwt authenticaiton
        const decoded = await User.findById(req.user.id)
          if (!decoded) return res.status(404).json({ msg: "User not found" });
    // restrict feature to staff only
        if (decoded.usertype !== 'driver' && decoded.usertype !== 'admin') {
            return res.status(500).json({ message: `Unable to perform action, you have to be staff member!` });
        } else {
            // obtain car id from request parameters
            const id = req.params.id;

            // find and delete a car by id
            Ambulance.findOneAndDelete({ _id: id })
                .select(selectFields)
                .exec()
                .then(car => {
                    // return success message in response
                    const response = {
                        message: `Deleted car of id '${car._id}' successfully`
                    }
                    res.status(200).json({ response });
                })
                .catch(error => {
                    // return error if there's any
                    res.status(500).json({ message: `Unable to DELETE ambulance of id '${id}'`, error: error });
                });
        }
})

//  @route    Put api/ambulance/:id
// @desc     updates  ambulance
// @access   Private
router.put('/:id',auth,async(req,res)=>{

    // jwt authenticaiton
        const decoded = await User.findById(req.user.id)
          if (!decoded) return res.status(404).json({ msg: "User not found" });
        // restrict feature to staff only
        if (decoded.usertype !== 'driver' && decoded.usertype !== 'admin') {
            return res.status(500).json({ message: `Unable to perform action, you have to be staff member!` });
        } else {
            // obtain car id from request parameters
            const id = req.params.id;
            // obtaining updated values in request body
            const updateOps = {};
            for (const ops of Object.entries(req.body)) {
                updateOps[ops[0]] = ops[1];
            }

            // update car by id with updated values
            Ambulance.updateOne({ _id: id }, { $set: updateOps })
                .select(selectFields)
                .exec()
                .then(car => {
                    // wrap and return car object in response
                    const response = {
                        message: `Updated ambulance of id '${car._id}' successfully`,
                        car: car
                    }
                    res.status(200).json({ response });
                })
                .catch(error => {
                    // return error if there's any
                    res.status(500).json({ message: `Unable to UPDATE car of id '${id}'`, error: error });
                });
        }
})


//  @route    Post api/ambulance/availability
// @desc      search available ambulance
// @access   Private
router.post('/availability',auth,(req,res)=>{

})

//  @route    Post api/ambulance/filter
// @desc      filter ambulance
// @access   Private
router.post('/filter',auth,(req,res)=>{

})
module.exports=router 