const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/model');
const session = require('cookie-session');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    name: 'session',
    keys: ['userid', 'password']
}));

let itemArray = null;

mongoose.connect('mongodb+srv://root:root@cluster0.9ytrvti.mongodb.net/?retryWrites=true&w=majority');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/login', (req, res) => {
    const username = req.body.user;

    req.session.authenticated = true;
    req.session.username = username;
    res.redirect('/manage');
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.get('/manage', (req, res) => {
    const username = req.session.username;

    Item.find({}).then((err, results) => {
            if (err) throw err;
            itemArray = results;
            res.render('manage', {
                username: username,
                items: itemArray
        });
    });
});

app.get('/manage/insert', (req, res) => {
    res.render('insert');
});

app.post('/insert', (req, res) => {
    const body = req.body;
    const newItem = new Item({
        name: body.name,
        type: body.type,
        quantity: body.qty,
        address: body.address
    });
    
    newItem.save(err => {
        if (err) alert('Error!');
        res.send('Saved');
        
    }).then(res.redirect('/insert'));
});

app.get('/search', (req, res) => {
    res.render('manage', {
        username: req.session.username,
        items: itemArray.filter(item => {
            const filter = req.body.search;
            item.name === filter || item.type === filter || item.quantity === parseInt(filter) || item.address === filter
        })
    });
});

app.get('/delete', (req, res) => {
    
    const body = req.body;

    const name = body.name;
    const type = body.type;
    const qty = body.quantity;
    const address = body.address;

    Item.deleteOne({name: name, type: type, quantity: qty, address: address}).then(err => {
        if (err) alert('Error');
        alert('Deleted');
        res.redirect('/manage');
    });
});

app.get('/manage/update', (req, res) => {
    res.render('update', {
        
    });
})

app.post('/update', (req, res) => {

})

app.listen(port);