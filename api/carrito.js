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
  const carrito = await carritosDao.addressCarrito(req)
  
  const productos = JSON.parse(carrito.productos)
  if (productos.length > 0) {
    tieneDatos = true
  } else {
    tieneDatos = false
  }
  carritosDao.finalizar(carrito)

  //WSP

  const accountSid = 'AC0728456364773cd2dcbbdffe3b2815bc'
  const authToken = '094ab180ed43a39a60f48f19a06fa90f'

  let contenido = 'Has finalizado la compra. Tu lista de productos: \r\n'
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
  productosMostrar.forEach((producto) => {
    contenido += producto.name + ' $' + producto.price + ' Cant.:' + producto.cantidad + ' ' + '\r\n'
  });

  const client = twilio(accountSid, authToken)
  try {
    const message = await client.messages.create({
      body: contenido,
      from: 'whatsapp:+14245411354',
      to: 'whatsapp:+5491160236500'
    })
    console.log(message)
    logger.info(message);
  } catch (error) {
    console.log(error)
    logger.error(error);
  };

  // SMS

  // const accountSidsms = 'AC60b9bbe54e286cf20f79ad601f382c2d'
  // const authTokensms = '0bb6f59d969d06b30e5cd44e80c5644a'

  // let content = 'Has finalizado la compra. Tu lista de productos: \r\n'
  // productosMostrar = []
  // productos.forEach((producto) => {
  //   const index = productosMostrar.findIndex((prod) => prod._id == producto._id);
  //   if(index >= 0){
  //     productosMostrar[index].cantidad = productosMostrar[index].cantidad + 1
  //   }else{
  //     productosMostrar.push(producto)
  //     productosMostrar[productosMostrar.length-1].cantidad = 1
  //   }
  // });  
  // productosMostrar.forEach((producto) => {
  //   content += producto.name + ' $' + producto.price + ' Cant.:' + producto.cantidad + ' ' + '\r\n'
  // });
  // console.log(productosMostrar)

  // const cliente = twilio(accountSidsms, authTokensms)

  // try {
  //   const message = await cliente.messages.create({
  //     body: content,
  //     from: '+17208066253',
  //     to: '+541133298803'
  //   })
  //   console.log(message)
  //   logger.info(message);
  // } catch (error) {
  //   console.log(error)
  //   logger.error(error);
  // }
  //   //GMAIL
    const transport = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      auth: {
        user: 'nico.alejandro20@gmail.com',
        pass: 'elfsrazyfzdpsfin'
        // pass: process.env.GMAIL_PWD
      }
    });

    let contents = 'Has finalizado la compra. Tu lista de productos: \r\n'
    // productosMostrar = []
  // productos.forEach((producto) => {
  //   const index = productosMostrar.findIndex((prod) => prod._id == producto._id);
  //   if(index >= 0){
  //     productosMostrar[index].cantidad = productosMostrar[index].cantidad + 1
  //   }else{
  //     productosMostrar.push(producto)
  //     productosMostrar[productosMostrar.length-1].cantidad = 1
  //   }
  // });  
  // productosMostrar.forEach((producto) => {
  //   contents += producto.name + ' $' + producto.price + ' Cant.:' + producto.cantidad + ' ' + '\r\n'
  // });
  // console.log(productosMostrar)

    transport.sendMail({
      from: 'Nico <nico.alejandro20@gmail.com>',
      to: 'nico.alejandro20@gmail.com',
      html: contents,
      subject: 'Lista de productos comprados',
    }).then((result) => {
      console.log(result);
      logger.info(result);
    }).catch(e => {
      logger.error(e)
    });
    res.redirect('/')
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
    const productos = JSON.parse(carrito.productos)
    if (productos.length > 0) {
      tieneDatos = true
    } else {
      tieneDatos = false
    }
})



module.exports = router;