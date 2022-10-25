const { optionfirebase } = require('../../../options/firebase');
var admin = require("firebase-admin");

const db = admin.firestore();

class Funciones {
    getSiguienteId = (carritos) => {
        let ultimoId = 0;
        carritos.forEach((carrito) => {
            if (carrito.id > ultimoId) {
                ultimoId = carrito.id;
            }
        });
        return ++ultimoId;
    };
}
const funciones = new Funciones();

let CarritosDaoFirebase = class CarritosDaoFirebase {

    crearCarrito = async (req, res) => {
        try {
            let query = db.collection("carritos");
            const querySnapshot = await query.get();
            let docs = querySnapshot.docs;
            const carritos = docs.map((doc) => ({
                id: doc.id,
                fecha: doc.data().fecha,
                productos: doc.data().productos
            }));

            await db
                .collection("carritos")
                .doc("/" + funciones.getSiguienteId(carritos) + "/")
                .create({
                    fecha: new Date(),
                    productos: JSON.stringify([])
                });
            return carritos
        } catch (error) {
            console.log(error);
        }
    }

    borrarCarrito = async (req, res) => {
        try {
            const doc = db.collection("carritos").doc(req.params.id_carrito);
            await doc.delete();
        } catch (error) {
            console.log(error);
        }
    }

    getProducto = async (req, res) => {
        try {
            const doc = db.collection("carritos").doc(req.params.id_carrito);
            const item = await doc.get()
            const response = item.data();
            return response;

        } catch (error) {
            console.log(error);
        }
    }

    nuevoProducto = async (req, res) => {
        try {
            const doc = db.collection("productos").doc(req.params.id_producto);
            const item = await doc.get()
            const producto = item.data();
            if (producto) {
                const docs = db.collection("carritos").doc(req.params.id_carrito);
                const items = await docs.get()
                const carrito = items.data();
                let productos = JSON.parse(carrito.productos)
                productos.push(producto)
                carrito.productos = JSON.stringify(productos)
                const document = db.collection("carritos").doc(req.params.id_carrito);
                await document.update(carrito);
                return carrito
            }
        } catch(error) {
            console.log(error)

        }
    }

    borrarProducto = async (req, res) => {
        try {
            const doc = db.collection("productos").doc(req.params.id_producto);
            const item = await doc.get()
            const producto = item.data();
            if (producto) {
                const docs = db.collection("carritos").doc(req.params.id_carrito);
                const items = await docs.get()
                const carrito = items.data();
                let productos = JSON.parse(carrito.productos)
                const index = productos.findIndex((producto) => producto.id == req.params.id_producto);
                productos.splice(index, 1);
                carrito.productos = JSON.stringify(productos)
                const document = db.collection("carritos").doc(req.params.id_carrito);
                await document.update(carrito);
                return carrito
            }
        } catch(error) {
            console.log(error)

        }
    }
}

module.exports = CarritosDaoFirebase