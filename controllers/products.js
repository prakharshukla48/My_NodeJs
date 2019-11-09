const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
    console.log('Hello from add product');
    
    res.render('add-product', {pageTitle: 'Add Products', path: '/admin/add-product'});
};

exports.postAddProduct = (req, res) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll();
    res.render('shop', {prods: products, pageTitle: 'Shop', path: '/'});  
};