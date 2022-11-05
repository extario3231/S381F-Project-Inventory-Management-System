const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: String,
    type: String,
    quantity: Number,
    address: String
});
const Item = mongoose.model('Item', itemSchema);

module.exports = Item;