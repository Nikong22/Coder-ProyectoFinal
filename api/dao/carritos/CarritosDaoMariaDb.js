const { options } = require('../../../options/mariaDB');
const knex = require('knex')(options);

const carritos = []

// knex.schema.dropTableIfExists('carritos')
// .then(()=>console.log('Tabla borrada...'))
// .catch(e=>{
//     console.log('Error en drop:', e);
//     knex.destroy();
//     process.exit(500);
// });

knex.schema.createTableIfNotExists('carritos', table => {
    table.increments('id'),
        table.timestamp('fecha'),
        table.text('productos')
})
    .catch(e => {
        console.log('Error en proceso:', e);
        knex.destroy();
    });
knex.from('carritos').select('*')
    .then((carritosDB) => {
        for (let carrito of carritosDB) {
            carritos.push(carrito)
        }
    })

let CarritosDaoMariaDb = class CarritosDaoMariaDb {

    crearCarrito = async (req, res) => {
        let carritoNuevo = {
            fecha: new Date(),
            productos: JSON.stringify([])
        };
        const carritos_id = await
            knex('carritos').insert(carritoNuevo)
                .then(function (result) {
                    console.log(result)
                    return result
                })
        const carrito = await
            knex.from('carritos').select('*').where('id', '=', carritos_id)
                .then((carrito) => {
                    return carrito
                })
        return carrito
    }

    borrarCarrito = (req, res) => {
        const { id_carrito } = req.params
        knex.from('carritos').where('id', '=', id_carrito).del()
            .then(() => {
                console.log('carrito borrado')
            })
    }

    getProducto = async (req, res) => {
        const { id_carrito } = req.params;
        const carrito = await
            knex.from('carritos').select('*').where('id', '=', id_carrito).first()
                .then((carrito) => {
                    return carrito
                })
        return carrito
    }

    nuevoProducto = async (req, res) => {
        const { id_carrito } = req.params;
        const { id_producto } = req.params;
        //Busco y obtengo el producto
        const producto = await knex.from('productos').select('*').where('id', '=', id_producto).first()
            .then((producto) => {
                return producto
            })
        //Si se encontro el producto, busco al carrito y agrego este producto en el carrito
        if (producto) {
            //Busco el carrito
            const carrito = await knex.from('carritos').select('*').where('id', '=', id_carrito).first()
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
                const updated = await knex.from('carritos').where('id', '=', id_carrito).update(({
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
        const producto = await knex.from('productos').select('*').where('id', '=', id_producto).first()
            .then((producto) => {
                return producto
            })
        //Si se encontro el producto, busco al carrito y agrego este producto en el carrito
        if (producto) {
            const carrito = await knex.from('carritos').select('*').where('id', '=', id_carrito).first()
                .then((carrito) => {
                    return carrito
                })
            if (carrito) {
                let productos = JSON.parse(carrito.productos)
                const index = productos.findIndex((producto) => producto.id == id_producto);
                productos.splice(index, 1);
                carrito.productos = JSON.stringify(productos)
                const updated = await knex.from('carritos').where('id', '=', id_carrito).update(({
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
}

module.exports = CarritosDaoMariaDb