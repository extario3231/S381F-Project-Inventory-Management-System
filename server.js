const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/model');
const session = require('cookie-session');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    name: 'session',
    keys: ['userid', 'password']
}));

mongoose.connect('mongodb+srv://root:root@cluster0.9ytrvti.mongodb.net/?retryWrites=true&w=majority');

function search(filter) {
    Item.find(filter, (err, results) => {
        if (err) throw err;
        res
    });
}

app.get("/", (req, res) => {
    res.render('index');
});

app.post("/login", (req, res) => {
    const username = req.body.user;

    req.session.authenticated = true;
    req.session.username = username;
    res.redirect('/manage');
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.get("/manage", (req, res) => {
    const username = req.session.username;

    Item.find({}, (err, results) => {
            if (err) throw err;
            res.render('manage', {
                username: username,
                items: results
        });
    });
});

app.post("/manage/insert", (req, res) => {
    res.render('insert');
});

app.post("/insert", (req, res) => {
    const body = req.body;
    const newItem = new Item({
        name: body.name,
        type: body.type,
        quantity: body.qty,
        address: body.address
    });
    
    newItem.save(err => {
        if (err) alert('Error!');
        alert('Saved');
    });
    res.redirect('/insert');
});

app.post('/delete', (req, res) => {
    const body = req.body;

    const name = body.name;
    const type = body.type;
    const qty = body.quantity;
    const address = body.address;

    Item.deleteOne({name: name, type: type, quantity: qty, address: address}, err => {
        if (err) alert('Error');
        alert('Deleted');
    });
});

app.listen(port);