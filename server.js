const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://root:root@cluster0.9ytrvti.mongodb.net/?retryWrites=true&w=majority');

const itemSchema = new mongoose.Schema({
    name: String,
    type: String,
    quantity: Number,
    address: String
});
const Item = mongoose.model('Item', itemSchema);

app.get("/", (req, res) => {
    res.render('index', {
        appName: 'Inventory Management System'
    });
});

app.get("/back", (req, res) => {
    res.redirect('back')
})

app.post("/login", (req, res) => {
    res.redirect('/manage');
});

app.get("/manage", (req, res) => {
    res.render('manage', {items: Item.find()});
});

app.post("/manage/insert", (req, res) => {
    res.render('insert')
})

app.post("/create", (req, res) => {
    
})

app.get("/manage/search", (req, res) => {
    Item.find()
})

app.listen(port);