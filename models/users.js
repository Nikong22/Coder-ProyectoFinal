const { optionsDB } = require('../options/mongoDB');
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    id: { type: Number, require: true },
    username: { type: String, require: true, minLength: 1, maxLength: 30 },
    password: { type: String, require: true, minLength: 1 },
    name: { type: String, require: true, minLength: 1, maxLength: 20 },
    surname: { type: String, require: true, minLength: 1, maxLength: 20 },
    phone: { type: Number, require: true, minLength: 1, maxLength: 10 },
    thumbnail: { type: String, require: true, minLength: 1 },
   
});
module.exports = User = mongoose.model('usuarios', UserSchema)
