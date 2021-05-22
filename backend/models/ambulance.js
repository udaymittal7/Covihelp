/* Car model definition */
const mongoose = require('mongoose');

const ambulanceSchema = mongoose.Schema({
    
    numberplate: { type: String, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    currentbooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }
});

module.exports = mongoose.model('Ambulance', ambulanceSchema);
