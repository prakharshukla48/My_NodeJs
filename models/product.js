const fs = require('fs');
const path = require('path');
const { resolve } = require('path');
const { rejects } = require('assert');
// const h = require('../util/path');


module.exports = class Product {
    constructor (title) {
        this.title = title;
    }

    save() {
        const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json');
        fs.readFile(p, (err, fileContent) => {
            console.log(fileContent);
            
            let products = [];
            if (!err) {
                products = JSON.parse(fileContent);
            }
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err);
                
            });
        });
        
        // products.push(this);
    }

    static fetchAll() {
        const promise = new Promise((resolve, reject) => {
            const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json');
            fs.readFile(p, (err, fileContent) => {
                if (err) {
                    return resolve([]);
                }
                resolve(JSON.parse(fileContent));
            });
        });
        return promise;
    }
}