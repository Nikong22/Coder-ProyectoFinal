const { optionsDB } = require('../options/mongoDB');
const mongoose = require('mongoose');

const CarritoSchema = mongoose.Schema({
  id: { type: Number, require: true },
  user_id: { type: String, require: true },
  activo: { type: Number, require: true },
  timestamp: { type: String, require: true, minLength: 1, maxLength: 50 },
  productos: { type: String, require: true },
  address: { type: String, require: true, minLength: 1, maxLength: 40 },
  number: { type: Number, require: true, minLength: 1, maxLength: 5 }
});
module.exports = CarritoDB = mongoose.model('carritos', CarritoSchema)