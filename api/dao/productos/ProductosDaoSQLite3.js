const { optionsSQL } = require('../../../options/SQLite3');
const knexSQL = require('knex')(optionsSQL);

const productos = [

];

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
  inicializar = (productos) => {
    let id = 1
    productos.forEach((producto) => {
      if (!producto.id) {
        producto.id = id++
      }
    });
  }
}
const funciones = new Funciones();
funciones.inicializar(productos)

// knexSQL.schema.dropTableIfExists('productos')
// .then(()=>console.log('Tabla borrada productos...'))
// .catch(e=>{
//     console.log('Error en drop:', e);
//     knexSQL.destroy();
//     process.exit(500);
// });

knexSQL.schema.createTableIfNotExists('productos', table => {
  table.increments('id'),
    table.string('name'),
    table.integer('price'),
    table.string('thumbnail'),
    table.string('description'),
    table.integer('code'),
    table.integer('stock')
})
  .catch(e => {
    console.log('Error en proceso:', e);
    knexSQL.destroy();
  });
knexSQL.from('productos').select('*')
  .then((productosDB) => {
    for (let producto of productosDB) {
      productos.push(producto)
    }
  })


let ProductosDaoSQLite3 = class ProductosDaoSQLite3 {

  getProductos = async (req, res) => {
    let productos = await
      knexSQL.from('productos').select('*')
        .then((productos) => {
          return productos
        })
    return productos
  }

  getProducto = async (req, res) => {
    const { id } = req.params;
    const producto = await
      knexSQL.from('productos').select('*').where('id', '=', id).first()
        .then((producto) => {
          return producto
        })
    return producto
  }

  nuevoProducto = (req, res) => {
    let { name, price, thumbnail, description, code, stock } = req.body;
    let productoNuevo = {
      id: funciones.getSiguienteId(productos),
      name,
      price,
      thumbnail,
      description,
      code,
      stock
    };
    knexSQL('productos').insert(productoNuevo)
      .then(function (result) {
        console.log(result)
      })
    productos.push(productoNuevo);
  }

  actualizarProducto = async (req, res) => {
    const { id } = req.params;
    let { name, price, thumbnail, description, code, stock } = req.body;
    const update = await
    knexSQL.from('productos').where('id', '=', id).update(({
      name: name, price: price, thumbnail: thumbnail,
      description: description, stock: stock, code: code
    }))
      .then((update) => {
        return update
      })
    return update
  }

  borrarProducto = async (req, res) => {
    const { id } = req.params;
    const deleted = await
      knexSQL.from('productos').where('id', '=', id).del()
        .then((deleted) => {
          return deleted
        })
    return deleted
  }
}

module.exports = ProductosDaoSQLite3