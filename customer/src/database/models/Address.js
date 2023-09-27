const { model, Schema } = require('mongoose');

const AddressSchema = new Schema({
    street: String,
    postalCode: String,
    city: String,
    country: String
});

module.exports = model('address', AddressSchema);