const { optionsSQL } = require('../../../options/SQLite3');
const knexSQL = require('knex')(optionsSQL);

const carritos = []

// knexSQL.schema.dropTableIfExists('carritos')
// .then(()=>console.log('Tabla borrada carritos...'))
// .catch(e=>{
//     console.log('Error en drop:', e);
//     knexSQL.destroy();
//     process.exit(500);
// });

knexSQL.schema.createTableIfNotExists('carritos', table => {
    table.increments('id'),
        table.timestamp('timestamp'),
        table.text('productos')
})
    .catch(e => {
        console.log('Error en proceso:', e);
        knexSQL.destroy();
    });
knexSQL.from('carritos').select('*')
    .then((carritosDB) => {
        for (let carrito of carritosDB) {
            carritos.push(carrito)
        }
    })

let CarritosDaoSQLite3 = class CarritosDaoSQLite3 {

    crearCarrito = async (req, res) => {
        let carritoNuevo = {
            timestamp: new Date(),
            productos: JSON.stringify([])
        };
        const carritos_id = await
            knexSQL('carritos').insert(carritoNuevo)
                .then(function (result) {
                    console.log(result)
                    return result
                })
        const carrito = await
            knexSQL.from('carritos').select('*').where('id', '=', carritos_id)
                .then((carrito) => {
                    return carrito
                })
        return carrito
    }

    borrarCarrito = (req, res) => {
        const { id_carrito } = req.params
        knexSQL.from('carritos').where('id', '=', id_carrito).del()
            .then(() => {
                console.log('carrito borrado')
            })
    }

    getProducto = async (req, res) => {
        const { id_carrito } = req.params;
        const carrito = await
            knexSQL.from('carritos').select('*').where('id', '=', id_carrito).first()
                .then((carrito) => {
                    return carrito
                })
        return carrito
    }

    nuevoProducto = async (req, res) => {
        const { id_carrito } = req.params;
        const { id_producto } = req.params;
       //Busco y obtengo el producto
       const producto = await knexSQL.from('productos').select('*').where('id', '=', id_producto).first()
       .then((producto) => {
           return producto
       })
   //Si se encontro el producto, busco al carrito y agrego este producto en el carrito
   if (producto) {
       //Busco el carrito
       const carrito = await knexSQL.from('carritos').select('*').where('id', '=', id_carrito).first()
           .then((carrito) => {
               return carrito
           })
       //Si se encontro el carrito:
       if (carrito) {
           //Obtengo los productos del carrito (es un JSON) y lo convierto a un array
           let productos = JSON.parse(carrito.productos)
           //Agrego el producto en el array de productos
           productos.push(producto)
           //Convierto el array a JSON y lo vuelvo a poner en carritos para luego hacer update
           carrito.productos = JSON.stringify(productos)
           //Hago update del carrito:
           const updated = await knexSQL.from('carritos').where('id', '=', id_carrito).update(({
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
        //Busco y obtengo el producto
        const producto = await knexSQL.from('productos').select('*').where('id', '=', id_producto).first()
            .then((producto) => {
                return producto
            })
        //Si se encontro el producto, busco al carrito y agrego este producto en el carrito
        if (producto) {
            //Busco el carrito
            const carrito = await knexSQL.from('carritos').select('*').where('id', '=', id_carrito).first()
                .then((carrito) => {
                    return carrito
                })
            //Si se encontro el carrito:
            if (carrito) {
                //Obtengo los productos del carrito (es un JSON) y lo convierto a un array
                let productos = JSON.parse(carrito.productos)
                //Agrego el producto en el array de productos
                const index = productos.findIndex((producto) => producto.id == id_producto);
                productos.splice(index, 1);
                //Convierto el array a JSON y lo vuelvo a poner en carritos para luego hacer update
                carrito.productos = JSON.stringify(productos)
                //Hago update del carrito:
                const updated = await knexSQL.from('carritos').where('id', '=', id_carrito).update(({
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
}

module.exports = CarritosDaoSQLite3