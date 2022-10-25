const fs = require('fs')

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
  //   let id = 1
  //   productos.forEach((producto) => {
  //     if (!producto.id) {
  //       producto.id = id++
  //     }
  //   });
  // }
}
const funciones = new Funciones();

let ProductosDaoArchivo = class ProductosDaoArchivo {

  getProductos = (req, res) => {
    let productos = fs.readFileSync('./productos.txt', 'utf-8');
    productos = JSON.parse(productos)
    return productos
  }

  getProducto = (req, res) => {
    const { id } = req.params;
    let productos = fs.readFileSync('./productos.txt', 'utf-8');
    productos = JSON.parse(productos)
    return productos.find((producto) => producto.id == id);
  }

  nuevoProducto = (req, res) => {
    let { name, price, description, code, category, thumbnail, stock } = req.body;
    let productos = fs.readFileSync('./productos.txt', 'utf-8');
    productos = JSON.parse(productos)
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
    fs.writeFileSync('./productos.txt', JSON.stringify(productos));
  }

  actualizarProducto = (req, res) => {
    const { id } = req.params;
    let productos = fs.readFileSync('./productos.txt', 'utf-8');
    productos = JSON.parse(productos)
    let { name, price, description, code, thumbnail, stock } = req.body;
    let producto = productos.find((producto) => producto.id == id);
    (producto.name = name), (producto.price = price), (producto.thumbnail = thumbnail),
      (producto.description = description), (producto.code = code), (producto.stock = stock)
    fs.writeFileSync('./productos.txt', JSON.stringify(productos));
  }

  borrarProducto = (req, res) => {
    const { id } = req.params;
    let productos = fs.readFileSync('./productos.txt', 'utf-8');
    productos = JSON.parse(productos)
    let producto = productos.find((producto) => producto.id == id);
    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }
    const index = productos.findIndex((producto) => producto.id == id);
    productos.splice(index, 1);
    fs.writeFileSync('./productos.txt', JSON.stringify(productos));
  }
}

module.exports = ProductosDaoArchivo