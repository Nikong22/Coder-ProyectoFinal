const express = require("express");
const { productosDao, carritosDao } = require('./dao/daos.js');

const { Router } = express;

let router = new Router();

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated() && req.cookies.username) {
      next();
  } else {
      res.redirect('/');
  }
}

router.get('/productos', checkAuthentication, async function (req, res) {
  const carrito = await carritosDao.getCarrito(req, res)
  const productos = await productosDao.getProductos()
  let tieneDatos;
  if (productos.length > 0) {
    tieneDatos = true
  } else {
    tieneDatos = false
  }
  res.render('main', { productos: productos, listExists: tieneDatos, carrito: carrito });
  // res.send(productos)
});

router.get("/productos/:category", checkAuthentication, async (req, res) => {
  const carrito = await carritosDao.getCarrito(req, res)
  const productos = await productosDao.getCategory(req, res);
    let tieneDatos;
    if (productos.length > 0) {
      tieneDatos = true
    } else {
      tieneDatos = false
    }
    res.render('category', { productos: productos, listExists: tieneDatos, carrito: carrito });
    // res.send(productos);
});

router.get("/producto/:id", checkAuthentication, async (req, res) => {
  const carrito = await carritosDao.getCarrito(req, res)
  const productos = await productosDao.getProducto(req, res);
  let tieneDatos;
  if (!productos) {
    tieneDatos = false
  } else {
    tieneDatos = true
  }
  // res.send(producto);
  res.render('proid', { productos: productos, listExists: tieneDatos, carrito: carrito });
});

router.post("/productos", checkAuthentication, function (req, res) {
  productosDao.nuevoProducto(req);
  res.send("Producto Añadido");
});

router.put("/productos/:id",  async (req, res) => {
  const update = await productosDao.actualizarProducto(req);
  if (update)
    res.send("Producto actualizado");
  else
    res.send("No existe el producto.");
});

router.delete("/productos/:id", async (req, res) => {
  const deleted = await
    productosDao.borrarProducto(req);
  if (deleted)
    res.send("Producto Borrado");
  else
    res.send("No existe el producto.");
});

module.exports = router;