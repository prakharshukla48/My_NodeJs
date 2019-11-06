const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

// const routes = require('./routes');
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();
const expressHbs = require('express-handlebars');

app.engine('handlebars', expressHbs);
app.set('view engine', 'handlebars');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Page not found!'});
});

app.listen(3000);