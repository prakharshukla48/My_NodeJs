const express = require('express');

const router = express.Router();

router.get('/add-product', (req, res, next) => {
    res.send('<form action="add-product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>');

});

router.post('/add-product', (req, res, next) => {
    res.redirect('/');
    console.log(req.body); 
});

module.exports = router;