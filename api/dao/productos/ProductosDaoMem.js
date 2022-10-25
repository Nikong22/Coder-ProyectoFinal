const productos = require("../../../models/productos");

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
    // inicializar = (productos) => {
    //     let id = 1
    //     productos.forEach((producto) => {
    //         if (!producto.id) {
    //             producto.id = id++
    //         }
    //     });
    // }
}
const funciones = new Funciones();
// funciones.inicializar(productos)

let ProductosDaoMem = class ProductosDaoMem {

    getProductos = (req, res) => {
        return productos
    }

    getProducto = (req, res) => {
        const { id } = req.params;
        return productos.find((producto) => producto.id == id);
    }

    nuevoProducto = (req, res) => {
        let { name, price, description, code, thumbnail, stock } = req.body;
        let productoNuevo = {
            id: funciones.getSiguienteId(productos),
            name,
            price,
            description,
            code,
            thumbnail,
            stock
        };
        productos.push(productoNuevo);
    }

    actualizarProducto = (req, res) => {
        const { id } = req.params;
        let { name, price, description, code, thumbnail, stock } = req.body;
        let producto = productos.find((producto) => producto.id == id);
        (producto.name = name), (producto.price = price), (producto.thumbnail = thumbnail),
            (producto.description = description), (producto.code = code), (producto.stock = stock)
    }

    borrarProducto = (req, res) => {
        const { id } = req.params;
        let producto = productos.find((producto) => producto.id == id);
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }
        const index = productos.findIndex((producto) => producto.id == id);
        productos.splice(index, 1);
    }
}

module.exports = ProductosDaoMem 