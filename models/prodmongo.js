const { optionsDB } = require('../options/mongoDB');
const mongoose = require('mongoose');

const ProductoSchema = mongoose.Schema({
  id: { type: Number, require: true },
  name: { type: String, require: true, minLength: 1, maxLength: 50 },
  description: { type: String, require: true, minLength: 1, maxLength: 25 },
  category: { type: String, require: true, minLength: 1, maxLength: 25 },
  code: { type: Number, require: true, minLength: 1, maxLength: 25 },
  price: { type: Number, require: true, minLength: 1, maxLength: 10 },
  thumbnail: { type: String, require: true, minLength: 1 },
  stock: { type: Number, require: true, minLength: 1, maxLength: 10 }
});

module.exports =  ProductoDB = mongoose.model('productos', ProductoSchema)