const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/model');
const session = require('cookie-session');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const puppeteer = require('puppeteer');
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

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/login', (req, res) => {
    const username = req.body.user;

    req.session.authenticated = true;
    req.session.username = username;
    res.redirect('/manage');
});

app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.get('/manage', (req, res) => {
    const username = req.session.username;

    Item.find({}, (err, results) => {
            if (err) throw err;
            res.render('manage', {
                username: username,
                items: results
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
        if (err) console.log('Error!');
        res.send('Saved');
    });
    res.redirect('/manage');
});

app.get('/manage/search', (req, res) => {
    res.render('search');
});

app.get('/search', (req, res) => {
    const query = req.query;

    for (const key in query) {
        if (Object.hasOwn(query, key) && query[key].length == 0) {
            delete query[key];
        }
    }

    Item.find(query, (err, results) => {
            if (err) throw err;
            res.render('manage', {
                username: req.session.username,
                items: results
        });
    });
});

app.get('/delete', (req, res) => {
    res.render('delete');
});

app.post('/item/delete', (req, res) => {
    const itemToDelete = req.body;

    for (const key in itemToDelete) {
        if (Object.hasOwn(itemToDelete, key) && itemToDelete[key].length == 0) {
            delete itemToDelete[key];
        }
    }
       
    Item.deleteOne(itemToDelete ,err => {
        if (err) console.log('Error');
        console.log('Deleted');
        res.redirect('/manage');
    });
});

app.get('/update', (req, res) => {
    const itemIndex = parseInt(req.query[0]);

    const sendData = async next => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
      
        await page.goto('http://localhost:3000/manage');
        
        const textContent = await page.evaluate(() => {
            return document.getElementsByTagName('p')[0].textContent.split(': ')[1]
        });
        next(textContent);
};  
    sendData((results) => {
        const array = [];
        for (let index = itemIndex; index < itemIndex + 3; index++) {
            console.log(results);
        }
        console.log(itemIndex);
    })
    // res.render('update', {
    //     name: name,
    // });
})

app.post('/item/update', (req, res) => {
    
})

app.listen(port);
