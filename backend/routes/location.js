const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const selectFields = '_id make seats bodytype numberplate colour costperhour fueltype location currentbooking image';

const Location = require('../models/location');

// without jwt guarding

//  @route    GET /api/location
// @desc     Get all locations
// @access   Public
router.get('/',(req,res)=>{
     // obtain all locations from database
    Location.find()
        // return location objects in response
        .then(locations => res.json(locations))
        // return error if there's any
        .catch(err => res.status(400).json('Error: ') + err);
})

//  @route    GET /api/location/:id
// @desc     Get location
// @access   Public

router.get('/:id',(req,res)=>{
    // obtain location id from request parameters
    const id = req.params.locationId;
    // get location object by id from database
    Location.findById(id)
        // return location object in response
        .then(location => res.json(location))
        // return error if there's any
        .catch(err => res.status(400).json('Error: ' + err));
})

//jwt guarding

//  @route    Patch /api/location/:id
// @desc     Update location
// @access   Private
router.patch('/:id',auth,async (req,res)=>{
     // jwt authenticaiton
        const decoded = await User.findById(req.user.id)
        if (!decoded) return res.status(404).json({ msg: "User not found" });

        if (decoded.usertype !== 'staff' && decoded.usertype !== 'admin') {
            return res.status(500).json({ message: `Unable to perform action, you have to be staff member!` });
        } else {
            // obtain location id from request parameters
            const id = req.params.locationId;
            // obtaining updated values in request body
            const updateOps = {};
            for (const ops of Object.entries(req.body)) {
                updateOps[ops[0]] = ops[1];
            }

            // update particular location by id with updated values
            Location.update({ _id: id }, { $set: updateOps })
                .select(selectFields)
                .exec()
                .then(location => {
                    // return success message in response
                    const response = {
                        message: `Updated location of id '${location._id}' successfully`
                    }
                    res.status(200).json({ response });
                })
                .catch(error => {
                    // return error if there's any
                    res.status(500).json({ message: `Unable to UPDATE location of id '${id}'`, error: error });
                });
        }

})

//  @route    Post /api/location/
// @desc     Create location
// @access   Private
router.post('/',auth,async(req,res)=>{
    // jwt authenticaiton
        const decoded = await User.findById(req.user.id)
        if (!decoded) return res.status(404).json({ msg: "User not found" });

        // restrict feature to staff only
        if (decoded.usertype !== 'staff' && decoded.usertype !== 'admin') {
            return res.status(500).json({ message: `Unable to perform action, you have to be staff member!` });
        } else {
            // obtain location address from request body
            const req_address = req.body.address;

            // check if location with same address already exists
            Location.findOne({ address: req_address }).then(location => {
                if (location) {
                    // return error if location with the same address already exsits
                    return res.status(400).json({ address: "Address already exists" });
                } else {
                    // create a location object
                    const location = new Location({
                        _id: new mongoose.Types.ObjectId(),
                        name: req.body.name,
                        address: req.body.address,
                        fleet: []
                    });
                    // save location object and return success message in response
                    location.save().then(location => {
                        res.json('New location added')
                    });
                }
            });
        }

})


module.exports=router