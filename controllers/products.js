const products = [];

exports.getAddProduct = (req, res) => {
    console.log('Hello from add product');
    
    res.render('add-product', {pageTitle: 'Add Products', path: '/admin/add-product'});
};

exports.postAddProduct = (req, res) => {
    products.push({title: req.body.title});
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    res.render('shop', {prods: products, pageTitle: 'Shop', path: '/'});  
};