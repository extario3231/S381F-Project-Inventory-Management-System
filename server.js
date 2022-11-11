const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/model');
const session = require('cookie-session');
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

app.post('/delete', (req, res) => {
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
    const key = Object.keys(req.query)[0];

    const getData = async (key) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.goto('http://localhost:3000/manage');
        await page.waitForSelector('p');

        const dataToSend = await page.evaluate((i) => {
            const data = []
            const allData = [...document.getElementsByTagName('p')];

            for (let index = i; index < i + 4; index++) {
                data.push(allData[index].textContent.split(': ')[1])
            }
            return data;
        }, key);
        browser.close();
        return dataToSend;
};
    getData(key).then((data) => {
        res.render('update', {
            name: data[0],
            type: data[1],
            qty: data[2],
            address: data[3]
        });
    });
    
});
    
app.post('/update', (req, res) => {
    const body = req.body;

    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.goto('http://localhost:3000/update');
        const name = await page.evaluate(() => document.getElementById('name').value);
        console.log(name);
    })();
});

app.listen(port);
