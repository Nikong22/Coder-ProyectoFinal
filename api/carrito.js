const express = require("express");
const { carritosDao } = require('./dao/daos.js');
const twilio = require('twilio')
const nodemailer = require('nodemailer');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
require('dotenv').config({ path: appDir + '/.env' })
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

router.post("/address", checkAuthentication, async (req, res) => {//agregar campos 
  const update = await carritosDao.addressCarrito(req)
  res.json(update);
  res.redirect('/api/productos');
});

router.get("/finalizar_compra/:id_carrito", async (req, res) => { //boton manda email, wsp, sms
  const carrito = await carritosDao.getCarrito(req, res)
  let tieneDatos;
  const productos = JSON.parse(carrito.productos)
  if (productos.length > 0) {
    tieneDatos = true
  } else {
    tieneDatos = false
  }
  carritosDao.finalizar(req, res)
  //WSP

  const accountSid = 'AC14764d5cd5e57cf1354d44f8d9fd77d0'
  const authToken = 'c6064ad58e7f61b378034ba200d5883e'

  let contenido = 'Has finalizado la compra. Tus datos: ' + carrito.address + carrito.number + '\r\n Tu lista de productos: \r\n'
  let productosMostrar = []
  productos.forEach((producto) => {
    const index = productosMostrar.findIndex((prod) => prod._id == producto._id);
    if (index >= 0) {
      productosMostrar[index].cantidad = productosMostrar[index].cantidad + 1
    } else {
      productosMostrar.push(producto)
      productosMostrar[productosMostrar.length - 1].cantidad = 1
    }
  });
  productosMostrar.forEach((producto) => {
    contenido += producto.name + ' $' + producto.price + ' Cant.:' + producto.cantidad + ' ' + '\r\n'
  });

  const client = twilio(accountSid, authToken)
  try {
    const message = await client.messages.create({
      body: contenido,
      from: 'whatsapp:+14245411354',
      to: 'whatsapp:+5491134047670'
    })
    console.log(message)
    logger.info(message);
  } catch (error) {
    console.log(error)
    logger.error(error);
  };

  // SMS

  const accountSidsms = 'AC3b31e13c3b94f9ac09e61fea944c5e64'
  const authTokensms = 'f0796299c4ac1b23a62aefe47b412a74'

  let content = 'Has finalizado la compra. Tu lista de productos: \r\n'
  productos.forEach((producto) => {
    content += producto.name + ' $' + producto.price + ' ' + '\r\n'
  });

  const cliente = twilio(accountSidsms, authTokensms)

  try {
    const message = await cliente.messages.create({
      body: content,
      from: '+19513570609',
      to: '+541137839891'
    })
    console.log(message)
    logger.info(message);
  } catch (error) {
    console.log(error)
    logger.error(error);
  }
  //   //GMAIL
  //   const transport = nodemailer.createTransport({
  //     service: 'gmail',
  //     port: 587,
  //     auth: {
  //       user: 'nico.alejandro20@gmail.com',
  //       pass: 'elfsrazyfzdpsfin'
  //     }
  //   });

  //   let contents = 'Has finalizado la compra. Tu lista de productos: \r\n'
  //   productos.forEach((producto) => {
  //     contents += producto.name + ' $' + producto.price + ' ' + '\r\n'
  //   });

  //   transport.sendMail({
  //     from: 'Nico <nico.alejandro20@gmail.com>',
  //     to: 'nico.alejandro20@gmail.com',
  //     html: contents,
  //     subject: 'Lista de productos comprados',
  //   }).then((result) => {
  //     console.log(result);
  //     logger.info(result);
  //   }).catch(e => {
  //     logger.error(e)
  //   });
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

router.post("/carrito/del_producto/:id_producto", checkAuthentication, async (req, res) => {//lista los carritos
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
  const carrito = await carritosDao.getCarrito(req, res)
  let tieneDatos;
  const productos = JSON.parse(carrito.productos)
  if (productos.length > 0) {
    tieneDatos = true
  } else {
    tieneDatos = false
  }
})

router.get("/chat", async () => {

})

router.get("/chat/:email", async () => {

})


module.exports = router;