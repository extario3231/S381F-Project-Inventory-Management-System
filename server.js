const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/model');
const session = require('cookie-session');
const puppeteer = require('puppeteer');
const app = express();
const PORT = 3000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    name: 'session',
    keys: ['userid', 'password']
}));

mongoose.connect('mongodb+srv://root:root@cluster0.9ytrvti.mongodb.net/?retryWrites=true&w=majority');

const getPage = async path => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`http://localhost:3000${path}`);
    return page;
}

const getData = async path => {
    const page = await getPage(path);
    await page.waitForSelector('p');

    const dataToSend = await page.evaluate(() => {
        const data = []
        const allData = [...document.querySelectorAll('p')];

        for (let index = 0; index < allData.length; index++) {
            if (index > 0 && (index + 1) % 4 === 0) {
                const name = allData[index-3].textContent;
                const type = allData[index-2].textContent;
                const qty = allData[index-1].textContent;
                const addr = allData[index].textContent;
                data.push([name, type, qty, addr]);
            }
        }

        return data;
    });
    await page.close();
    return dataToSend;
};

let url;
let originalData;

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/login', (req, res) => {
    const username = req.body.user;

    req.session.authenticated = true;
    req.session.username = username;
    res.status(200).redirect('/manage');
});

app.post('/logout', (req, res) => {
    req.session = null;
    res.status(200).redirect('/');
});

app.get('/manage', (req, res) => {
    const username = req.session.username;

    Item.find({}, (err, results) => {
            if (err) throw err;
            res.status(200).render('manage', {
                username: username,
                items: results
        });
    });
});

app.get('/manage/insert', (req, res) => {
    res.render('insert');
});

app.get('/manage/insert/api/name/:n/type/:t/quantity/:q/address/:a', (req, res) => {
    const body = req.body;

    const newItem = new Item({
        name: req.params.n,
        type: req.params.t,
        quantity: req.params.q,
        address: req.params.a
    });
    
    newItem.save(err => {
        if (err) console.log('Error!');
        console.log('Saved');
    });
    res.status(200).redirect('/manage');
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
        console.log('Saved');
    });
    res.status(200).redirect('/manage');
});

app.get('/manage/search', (req, res) => {
    res.status(200).render('search');
});

app.get('/search', (req, res) => {
    const query = req.query;

    for (const [key, value] of Object.entries(query)) {
        if (value.length === 0) {
            delete query[key];
        }
    }

    Item.find(query, (err, results) => {
        if (err) res.status(404).render('404');
        res.status(200).render('manage', {
            username: req.session.username,
            items: results
        });
        url = req.originalUrl;
    });
});

app.post('/delete/batch', (req, res) => {
    const itemsToDeleteIndecies = req.body.arr.split(',').map(e => parseInt(e));

    getData('/manage').then(data => {
        const itemToDeleteDataArr = itemsToDeleteIndecies.map(i => {
            const arr = data[i];
            return {name: arr[0], type: arr[1], quantity: arr[2], address: arr[3]};
        });

        itemToDeleteDataArr.forEach(e => {
            Item.deleteOne(e, err => {
            if (err) res.status(404).render('404');
            });
        }); 
    res.status(200).redirect('/manage');
    });
})

app.post('/delete', (req, res) => {
    const itemToDeleteKey = Object.keys(req.body)[0];
    const currentUrl = url === undefined ? '/manage' : url;

    getData(currentUrl).then(data => {
        const dataPos = data[itemToDeleteKey];
        const filter = {name: dataPos[0], type: dataPos[1], quantity: dataPos[2], address: dataPos[3]};

        Item.deleteOne(filter, err => {
            if (err) console.log('Error');
            console.log('Deleted');
            res.status(200).redirect('/manage');
        });
    });
});

app.get('/update', (req, res) => {
    const key = Object.keys(req.query)[0];
    
    getData('/manage').then(data => {
        const dataPos = data[key];
        if (dataPos === undefined)
            res.status(404).render('404');
        
        originalData = {name: dataPos?.[0], type: dataPos?.[1], quantity: dataPos?.[2], address: dataPos?.[3]};
        res.status(200).render('update', originalData);
    });
});
    
app.post('/item/update', (req, res) => {
    const form = req.body;
    delete originalData['._locals'];
    const dataToUpdate = {};
    for (const key in form) {
        if (form[key] !== originalData[key])
            dataToUpdate[key] = form[key];
    }
    
    Item.updateOne(originalData, dataToUpdate, err => {
        if (err) res.status(404).render('404');
        console.log('Updated');
        res.status(200).redirect('/manage');
    });
});

app.listen(PORT);
