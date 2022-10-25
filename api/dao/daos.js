const { dirname } = require('path');
const appDir = dirname(require.main.filename);
require('dotenv').config({ path: appDir + '/.env' })

let productosDao
let carritosDao

switch ('mongodb') {
    case 'json':
        const CarritosDaoArchivo = require('./carritos/CarritosDaoArchivo.js')
        carritosDao = new CarritosDaoArchivo();
        const ProductosDaoArchivo = require('./productos/ProductosDaoArchivo.js')
        productosDao = new ProductosDaoArchivo();
        break
    case 'firebase':
        //cambiar:
        const ProductosDaoFirebase = require('./productos/ProductosDaoFirebase')
        productosDao = new ProductosDaoFirebase()
        const CarritosDaoFirebase = require('./carritos/CarritosDaoFirebase')
        carritosDao = new CarritosDaoFirebase()
        break
    case 'mongodb':
        //cambiar:
        const ProductosDaoMongoDB = require('./productos/ProductosDaoMongoDB.js')
        productosDao = new ProductosDaoMongoDB();
        const CarritosDaoMongoDB = require('./carritos/CarritosDaoMongoDB.js')
        carritosDao = new CarritosDaoMongoDB();
        break
    case 'mariadb':
        //cambiar:
        const CarritosDaoMariaDb = require('./carritos/CarritosDaoMariaDb.js')
        carritosDao = new CarritosDaoMariaDb();
        const ProductosDaoMariaDb = require('./productos/ProductosDaoMariaDb.js')
        productosDao = new ProductosDaoMariaDb();

        break
    case 'sqlite3':
        //cambiar:
        const ProductosDaoSQLite3 = require('./productos/ProductosDaoSQLite3.js')
        productosDao = new ProductosDaoSQLite3();
        const CarritosDaoSQLite3 = require('./carritos/CarritosDaoSQLite3.js')
        carritosDao = new CarritosDaoSQLite3();
        break
    default:
        //cambiar:
        const ProductosDaoMem = require('./productos/ProductosDaoMem.js')
        productosDao = new ProductosDaoMem();
        const CarritoDaoMem = require('./carritos/CarritosDaoMem.js')
        carritosDao = new CarritoDaoMem();
        break
}

module.exports = { productosDao, carritosDao }