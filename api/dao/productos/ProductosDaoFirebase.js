const { optionfirebase } = require('../../../options/firebase');
var admin = require("firebase-admin");

const db = admin.firestore();

class Funciones {
    getSiguienteId = (productos) => {
        let ultimoId = 0;
        productos.forEach((producto) => {
            if (producto.id > ultimoId) {
                ultimoId = producto.id;
            }
        });
        return ++ultimoId;
    };
}
const funciones = new Funciones();

let ProductosDaoFirebase = class ProductosDaoFirebase {

    getProductos = async (req, res) => {
        try {
            let query = db.collection("productos");
            const querySnapshot = await query.get();
            let docs = querySnapshot.docs;
            const response = docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
                price: doc.data().price,
                thumbnail: doc.data().thumbnail,
                description: doc.data().description,
                code: doc.data().code,
                stock: doc.data().stock
            }));
            return response

        } catch (error) {
            console.log(error);
        }
        return response
    }

    getProducto = async (req, res) => {
        try {
            const doc = db.collection("productos").doc(req.params.id);
            const item = await doc.get()
            const response = item.data();
            return response;
        } catch (error) {
            console.log(error);
        }
        return response
    }

    nuevoProducto = async (req, res) => {
        try {
            let query = db.collection("productos");
            const querySnapshot = await query.get();
            let docs = querySnapshot.docs;
            const productos = docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
                price: doc.data().price,
                thumbnail: doc.data().thumbnail,
                description: doc.data().description,
                code: doc.data().code,
                stock: doc.data().stock
            }));

            await db
                .collection("productos")
                .doc("/" + funciones.getSiguienteId(productos) + "/")
                .create({
                    name: req.body.name,
                    price: req.body.price,
                    thumbnail: req.body.thumbnail,
                    description: req.body.description,
                    code: req.body.code,
                    stock: req.body.stock
                });
            return productos
        } catch (error) {
            console.log(error)
        }
    }

    actualizarProducto = async (req, res) => {
        try {
            const document = db.collection("productos").doc(req.params.id);
            await document.update({
                name: req.body.name,
                price: req.body.price,
                thumbnail: req.body.thumbnail,
                description: req.body.description,
                code: req.body.code,
                stock: req.body.stock
            });
            return document
        } catch (error) {
            console.log(error);
        }
        return document
    }

    borrarProducto = async (req, res) => {
        try {
            const doc = db.collection("productos").doc(req.params.id);
            await doc.delete();
            return res.json();
        } catch (error) {
            console.log(error);
        }
    }
}
module.exports = ProductosDaoFirebase