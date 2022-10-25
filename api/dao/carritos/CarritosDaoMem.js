let carritos = require("../../../models/carritos");
const productos = require("../../../models/productos");

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
    // inicializar = (carritos) => {
    //     let id = 1
    //     carritos.forEach((carrito) => {
    //         if (!carrito.id) {
    //             carrito.id = id++
    //         }
    //     });
    // }
}

const funciones = new Funciones();
// funciones.inicializar(carrito)

let CarritoDaoMem = class CarritoDaoMem {

    crearCarrito = (req, res) => {
        let carrito = {
            id: funciones.getSiguienteId(carritos),
            timestamp: Date.now(),
            productos: [
            ]
        }
        carritos.push(carrito)
        return carritos
    }

    borrarCarrito = (req, res) => {
        const { id_carrito } = req.params
        const index = carritos.findIndex((carrito) => carrito.id == id_carrito);
        carritos.splice(index, 1);
        return carritos 
    }

    getProducto = (req, res) => {
        const { id_carrito } = req.params;
        const carrito = carritos.find((carrito) => carrito.id == id_carrito);
        return carrito
    }

    nuevoProducto = (req, res) => {
        const { id_carrito } = req.params;
        const { id_producto } = req.params;
        const carrito = carritos.find((carrito) => carrito.id == id_carrito);
        const producto = productos.find((producto) => producto.id == id_producto);
        carrito.productos.push(producto);
        return carrito
    }

    borrarProducto = (req, res) => {
        const { id_carrito } = req.params;
        const { id_producto } = req.params;
        const carrito = carritos.find((carrito) => carrito.id == id_carrito);
        const index = carrito.productos.findIndex((producto) => producto.id == id_producto);
        carrito.productos.splice(index, 1);
    }
}

module.exports = CarritoDaoMem 