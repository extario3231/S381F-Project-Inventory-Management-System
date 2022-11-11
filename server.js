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

const getData = async (key) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.goto('http://localhost:3000/manage');
        await page.waitForSelector('p');

        const dataToSend = await page.evaluate((i) => {
            const data = []
            const allData = [...document.getElementsByTagName('p')];
            let counter = 0;

            for (let index = 0; index < allData.length; index++) {
                if (index > 0 && (index + 1) % 4 === 0) {
                    const name = allData[index-3].textContent.split(': ')[1];
                    const type = allData[index-2].textContent.split(': ')[1];
                    const qty = allData[index-1].textContent.split(': ')[1];
                    const addr = allData[index].textContent.split(': ')[1];
                    data.push([name, type, qty, addr]);
                }
            }

            return data;
        }, key);
        browser.close();
        return dataToSend;
};

app.get('/update', (req, res) => {
    const key = Object.keys(req.query)[0];
    
    getData(key).then((data) => {
        dataPos = data[key]
        res.render('update', {
            name: dataPos[0],
            type: dataPos[1],
            qty: dataPos[2],
            address: dataPos[3]
        });
    });
    
});
    
app.post('/item/update', (req, res) => {
    const param = Object.keys(req.query)[0];
    console.log(req.query);

    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.goto(`http://localhost:3000/update?${param}=`);
        const name = await page.evaluate(() => {
            const data = []
            const allData = [...document.getElementsByTagName('input')];
            return document.getElementsByTagName('input')[0].value;

            // for (let index = 0; index < allData; index++) {
            //     data.push(allData[index])
            // }
            // return data;
        });
        console.log(name);
    })();
});

app.listen(port);
