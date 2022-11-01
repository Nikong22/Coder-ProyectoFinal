const CarritoDB = require('../../../models/cartmongo');
const OrdenDB = require('../../../models/ordenes');
const logger = require('../../../logger');

class Funciones {
  getSiguienteId = (orders) => {
      let ultimoId = 0;
      orders.forEach((order) => {
          if (order.id > ultimoId) {
              ultimoId = order.id;
          }
      });
      return ++ultimoId;
  };
}

const funciones = new Funciones();

let CarritosDaoMongoDB = class CarritosDaoMongoDB {

  crearCarrito = async (req, res) => {
    const user_id = req.user._id.toString()
    let carrito = await
      CarritoDB.find({ "user_id": user_id, "estado": 1 }).lean()
        .then((carrito) => {
          return carrito
        })

    if (carrito.length == 0) {
      let carritoNuevo = {
        fecha: new Date(),
        productos: JSON.stringify([]),
        user_id: user_id,
        estado: 1
      }
      const carritos_id = await
        CarritoDB.insertMany(carritoNuevo)
          .then(function (result) {
            // console.log(result)
            logger.info(result)
            return result
          })
      carrito = await
        CarritoDB.find({ "_id": carritos_id }).lean()
          .then((carrito) => {
            return carrito
          })
    }

    return carrito[0]
  }

  finalizar = async (carrito) => {
    CarritoDB.updateOne({ "_id": carrito._id.toString() }, { 'estado': 0 })
      .then((update) => {
        return update
      })
  }

  borrarCarrito = (req, res) => {
    const { id_carrito } = req.params
    if (!id_carrito.match(/^[0-9a-fA-F]{24}$/)) {
      return null
    }
    CarritoDB.deleteOne({ "_id": id_carrito })
      .then(() => {
        // console.log('carrito borrado')
        logger.info('carrito borrado')
      })
  }

  getCarrito = async (req, res) => {
    const { id_carrito } = req.params;
    if (id_carrito) {
      if (!id_carrito.match(/^[0-9a-fA-F]{24}$/)) {
        return null
      }
      const carrito = await
        CarritoDB.findOne({ "_id": id_carrito }).lean()
          .then((carrito) => {
            return carrito
          })
      return carrito
    } else {
      return this.crearCarrito(req)
    }
  }

  getCarritos = async (req, res) => {
    let carritos = await
      CarritoDB.find({}).lean()
        .then((carritos) => {
          return carritos
        })
    return carritos
  }


  nuevoProducto = async (req, res) => {
    const { id_carrito } = req.params;
    const { id_producto } = req.params;
    if (!id_carrito.match(/^[0-9a-fA-F]{24}$/)) {
      return null
    }
    if (!id_producto.match(/^[0-9a-fA-F]{24}$/)) {
      return null
    }
    const producto = await ProductoDB.findOne({ "_id": id_producto })
      .then((producto) => {
        return producto
      })
    if (producto) {
      const carrito = await CarritoDB.findOne({ "_id": id_carrito })
        .then((carrito) => {
          return carrito
        })
      if (carrito) {
        let productos = JSON.parse(carrito.productos)
        productos.push(producto)
        carrito.productos = JSON.stringify(productos)
        const updated = await CarritoDB.findOne({ "_id": id_carrito }).updateOne(({
          productos: carrito.productos
        }))
          .then((updated) => {
            return updated
          })
        //Si se pudo modificar devuelvo el carrito
        if (updated) {
          return carrito
        } else {//Si no se pudo modificar (algun error), devuelvo null
          return null
        }
      } else {//Si no se encontro el carrito, return null
        return null
      }
    } else {//Si no se encontro el producto, return null
      return null
    }
  }

  borrarProducto = async (req, res) => {
    const { id_carrito } = req.params;
    const { id_producto } = req.params;
    if (!id_carrito.match(/^[0-9a-fA-F]{24}$/)) {
      return null
    }
    if (!id_producto.match(/^[0-9a-fA-F]{24}$/)) {
      return null
    }
    const producto = await ProductoDB.findOne({ "_id": id_producto })
      .then((producto) => {
        return producto
      })
    if (producto) {
      const carrito = await CarritoDB.findOne({ "_id": id_carrito })
        .then((carrito) => {
          return carrito
        })
      if (carrito) {
        let productos = JSON.parse(carrito.productos)
        const index = productos.findIndex((producto) => producto.id == id_producto);
        productos.splice(index, 1);
        carrito.productos = JSON.stringify(productos)
        const updated = await CarritoDB.findOne({ "_id": id_carrito }).updateOne(({
          productos: carrito.productos
        }))
          .then((updated) => {
            return updated
          })
        if (updated) {
          return carrito
        } else {//Si no se pudo modificar (algun error), devuelvo null
          return null
        }
      } else {//Si no se encontro el carrito, return null
        return null
      }
    } else {//Si no se encontro el producto, return null
      return null
    }
  }

  agregarProducto = async (req, res) => {
    const { id_producto } = req.params;
    const { stock } = req.body;
    if (!id_producto.match(/^[0-9a-fA-F]{24}$/)) {
      return null
    }
    const producto = await ProductoDB.findOne({ "_id": id_producto })
      .then((producto) => {
        return producto
      })
    if (producto) {
      const carrito = await this.getCarrito(req, res)
      let productos = JSON.parse(carrito.productos)
      for (let i = 0; i < stock; i++) {
        productos.push(producto)
      }
      carrito.productos = JSON.stringify(productos)
      const updated = await CarritoDB.findOne({ "_id": carrito._id }).updateOne(({
        productos: carrito.productos
      }))
        .then((updated) => {
          return updated
        })
      //Si se pudo modificar devuelvo el carrito
      if (updated) {
        await ProductoDB.findOne({ "_id": id_producto }).updateOne(({
          stock: producto.stock - stock
        }))
        return carrito
      } else {//Si no se pudo modificar (algun error), devuelvo null
        return null
      }
    } else {//Si no se encontro el producto, return null
      return null
    }
  }

  delProducto = async (req, res) => {
    const { id_producto } = req.params;
    if (!id_producto.match(/^[0-9a-fA-F]{24}$/)) {
      return null
    }
    const producto = await ProductoDB.findOne({ "_id": id_producto })
      .then((producto) => {
        return producto
      })
    if (producto) {
      const carrito = await this.getCarrito(req, res)
      let productos = JSON.parse(carrito.productos)
      const index = productos.findIndex((producto) => producto._id == id_producto);
      console.log('id_producto: ' + id_producto)
      console.log('index: ' + index)
      productos.splice(index, 1);
      carrito.productos = JSON.stringify(productos)
      const updated = await CarritoDB.findOne({ "_id": carrito._id }).updateOne(({
        productos: carrito.productos
      }))
        .then((updated) => {
          return updated
        })
      //Si se pudo modificar devuelvo el carrito
      if (updated) {
        await ProductoDB.findOne({ "_id": id_producto }).updateOne(({
          stock: producto.stock + 1
        }))
        return carrito
      } else {//Si no se pudo modificar (algun error), devuelvo null
        return null
      }
    } else {//Si no se encontro el producto, return null
      return null
    }
  }

  addressCarrito = async (req, res) => {
    const user_id = req.user._id.toString()
    let carrito = await
      CarritoDB.findOne({ "user_id": user_id, "estado": 1 }).lean()
        .then((carrito) => {
          return carrito
        })
    let { address, number } = req.body;
    await CarritoDB.updateOne({ "_id": carrito._id.toString() }, { 'address': address, 'number': number })
      .then((update) => {
        return update
      })
    return await CarritoDB.findOne({ "_id": carrito._id.toString() }).lean()
        .then((carrito) => {
          return carrito
        })
  }

  listOrders = async (req, res) => {
    const user_id = req.user._id.toString()
    let orders = new OrdenDB({
      id:  funciones.getSiguienteId,
      user_id: user_id,
      fecha: new Date(),
      productos: productosMostrar,
      estado: 'generada',
      email: username,
    })
    return orders
  }
}


module.exports = CarritosDaoMongoDB