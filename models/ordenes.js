const { optionsDB } = require('../options/mongoDB');
const mongoose = require('mongoose');

const OrdenSchema = mongoose.Schema({
    id: { type: Number, require: true },
    numOrder: { type: Number, require: true },
    user_id: { type: String, require: true },
    fecha: { type: String, require: true, minLength: 1, maxLength: 50 },
    productos: { type: String, require: true },
    estado: { type: String, require: true },
    email: { type: String, require: true },
});
module.exports = OrdenDB = mongoose.model('orden', OrdenSchema)
