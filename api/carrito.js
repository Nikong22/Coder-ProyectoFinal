const express = require("express");
const { carritosDao } = require('./dao/daos.js');
const twilio = require('twilio')
const nodemailer = require('nodemailer');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
// require('dotenv').config({ path: appDir + '/.env' })
require('dotenv').config({ path: __dirname + '/.env' })//server
const logger = require('../logger');


const { Router } = express;

let router = new Router();

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated() && req.cookies.username) {
    next();
  } else {
    res.redirect('/');
  }
}

router.post("/carrito", async (req, res) => {//crear carrito
  const carrito = await carritosDao.crearCarrito(req)
  res.json(carrito);
  res.status(200).end();
});

router.delete("/carrito/:id_carrito", (req, res) => { //borrar carrito
  const index = carritosDao.borrarCarrito(req);
  if (index == null) {
    return res.status(404).json({ msg: "Carrito no encontrado" });
  }
  res.status(200).end();
});

router.get("/carrito/:id_carrito/productos", async (req, res) => {//lista los productos del carrito
  const carrito = await carritosDao.getCarrito(req, res)
  if (carrito == null) {
    return res.send("No existe el carrito")
  }
  res.json(carrito);
});

router.get("/carritos", async (req, res) => {//lista los carritos
  const carritos = await carritosDao.getCarritos(req, res)
  if (carritos == null) {
    return res.send("No existe el carrito")
  }
  res.json(carritos);
});

router.get("/carrito/:id_carrito", async (req, res) => {//lista los productos del carrito en hbs
  const carrito = await carritosDao.getCarrito(req, res)
  let tieneDatos;
  const productos = JSON.parse(carrito.productos)
  if (productos.length > 0) {
    tieneDatos = true
  } else {
    tieneDatos = false
  }
  res.render('carts', { carrito: carrito, productos: productos, listExists: tieneDatos });
});

router.post("/address", checkAuthentication, async (req, res) => {//agregar campos y envia mensajes
  const carrito = await carritosDao.addressCarrito(req)
  
  let tieneDatos
  const productos = JSON.parse(carrito.productos)
  if (productos.length > 0) {
    tieneDatos = true
  } else {
    tieneDatos = false
  }
  carritosDao.finalizar(carrito)

  let productosMostrar = []
  productos.forEach((producto) => {
    const index = productosMostrar.findIndex((prod) => prod._id == producto._id);
    if(index >= 0){
      productosMostrar[index].cantidad = productosMostrar[index].cantidad + 1
    }else{
      productosMostrar.push(producto)
      productosMostrar[productosMostrar.length-1].cantidad = 1
    }
  });  
  const username = req.cookies.username 
  await carritosDao.generarOrdenes(carrito, productosMostrar, username)
  

  //WSP

  // const accountSid = process.env.ACCOUNT_SID;
  // const authToken = process.env.AUTH_TOKEN;


  // let contenido = 'Has finalizado la compra. Tu lista de productos: \r\n'
  
  // productosMostrar.forEach((producto) => {
  //   contenido += producto.name + ' $' + producto.price + ' Cant.:' + producto.cantidad + ' ' + '\r\n'
  // });

  // const client = twilio(accountSid, authToken)
  // try {
  //   const message = await client.messages.create({
  //     body: contenido,
  //     from: process.env.FROM_WSP,
  //     to: process.env.TO_WSP
  //   })
  //   console.log(message)
  //   logger.info(message);
  // } catch (error) {
  //   console.log(error)
  //   logger.error(error);
  // };

  // // SMS

  // const accountSidsms = process.env.ACCOUNT_SIDSMS
  // const authTokensms = process.env.AUTH_TOKENSMS

  // let content = 'Has finalizado la compra. Tu lista de productos: \r\n'

  // productosMostrar.forEach((producto) => {
  //   content += producto.name + ' $' + producto.price + ' Cant.:' + producto.cantidad + ' ' + '\r\n'
  // });

  // const cliente = twilio(accountSidsms, authTokensms)

  // try {
  //   const message = await cliente.messages.create({
  //     body: content,
  //     from: process.env.FROM_SMS,
  //     to: process.env.TO_SMS
  //   })
  //   console.log(message)
  //   logger.info(message);
  // } catch (error) {
  //   console.log(error)
  //   logger.error(error);
  // }

  // //   //GMAIL
  //   const transport = nodemailer.createTransport({
  //     service: 'gmail',
  //     port: 587,
  //     auth: {
  //       user: process.env.USER_GML,
  //       pass: process.env.PASS_GML
  //     }
  //   });

  //   let contents = 'Has finalizado la compra. Tu lista de productos: \r\n'
  // productosMostrar.forEach((producto) => {
  //   contents += producto.name + ' $' + producto.price + ' Cant.:' + producto.cantidad + ' ' + '\r\n'
  // });

  //   transport.sendMail({
  //     from: process.env.FROM_GML,
  //     to: process.env.TO_GML,
  //     html: contents,
  //     subject: 'Lista de productos comprados',
  //   }).then((result) => {
  //     console.log(result);
  //     logger.info(result);
  //   }).catch(e => {
  //     logger.error(e)
  //   });
    res.redirect('/api/ordenes')
});

router.post("/carrito/:id_carrito/productos/:id_producto", async (req, res) => {//agrega productos al carrito postman
  const carrito = await carritosDao.nuevoProducto(req);
  if (carrito) {
    res.json(carrito);
  } else {
    res.json('No se pudo agregar el producto al carrito');
  }
});

router.post("/carrito/agregar_producto/:id_producto", checkAuthentication, async (req, res) => {//agrega productos al carrito hbs
  const carrito = await carritosDao.agregarProducto(req);
  if (carrito) {
    res.redirect('/api/carrito/' + carrito._id);
  } else {
    res.json('No se pudo agregar el producto al carrito');
  }
});

router.post("/carrito/del_producto/:id_producto", checkAuthentication, async (req, res) => {//borra producto de carrito
  const carrito = await carritosDao.delProducto(req, res)
  if (carrito) {
    res.redirect('/api/carrito/' + carrito._id);
  } else {
    return res.send("No existe el carrito")
  }
});

router.delete("/carrito/:id_carrito/productos/:id_producto", async (req, res) => { //borrar un producto del carrito por su id de carrito y de producto
  const index = await carritosDao.borrarProducto(req);
  if (index == null) {
    return res.status(404).json({ msg: "Carrito no encontrado" });
  }
  res.status(200).end();
});

router.get("/ordenes", async (req, res) => {
  const orders = await carritosDao.listOrders(req, res)
  let tieneDatos
  if (orders.length > 0){
    tieneDatos = true
  } else {
    tieneDatos = false
  }
    res.render('orders', { orders: orders, listExists: tieneDatos });
})

router.get("/order/:id", async (req, res) => {
  const order = await carritosDao.getOrder(req, res)
  const carrito = await carritosDao.getCarrito(req, res)
  console.log(order)
  const productos = JSON.parse(carrito.productos)
  if (productos.length > 0) {
    tieneDatos = true
  } else {
    tieneDatos = false
  }
  console.log(productos)
  res.render('order', { order: order, productos:productos})
  // res.json(order);

})
module.exports = router;