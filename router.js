const { carritosDao } = require('./api/dao/daos.js');
const logger = require('./logger');

function getLogin(req, res){
    if (req.isAuthenticated()){
        let user = req.user;
        console.log('Usuario logueado');
        logger.info('Usuario logueado');
        res.json(user);
    } else {
        console.log('Usuario no logueado');
        logger.warn('Usuario no logueado');
        res.redirect('/');
    }
}

async function postLogin(req, res){
    let user = req.user;
    user.visitas++;

    const carrito = await carritosDao.crearCarrito(req)
    var carrito_id = carrito._id.toString()
    res.cookie('carrito_id', carrito_id);

    res.redirect('/datos');
}

function getFailLogin(req, res){
    res.redirect('/error-login.html');
}

function getSignUp(req, res){
    res.redirect('/register.html');
}

function postSignUp(req, res){
    res.redirect('/datos');
}

function getFailSignUp(req, res){
    res.redirect('/error-signup.html');
}

function getLogout(req, res){
    req.logout(function(err) {
        // console.log('logout1')
        logger.info('logout1');
        if (err) { return next(err); }
        res.cookie('username', '' );
        res.cookie('avatar', '' );
        res.cookie('carrito_id', '' );
        // console.log('logout2')
        logger.info('logout2');
        res.redirect('/');
    });
}

function failRoute(req, res){
    res.status(404).send('Ruta no encontrada');
}

function getRutaProtegida(req, res){
    res.send('<h1>Pude ingresar a la ruta protegida</h1>');
}

function getDatos(req,res){
    // console.log('getDatos');
    logger.info('getDatos');
    if (req.isAuthenticated()) {
        // console.log('entra al if');
        logger.info('entra al if');
        let user = req.user;
        // console.log(user);
        logger.info(user);
        res.cookie('username', user.username,  { signed: false, maxAge: 500000 } );
        res.cookie('avatar', '/uploads/' + user.thumbnail,  { signed: false, maxAge: 500000 } );
        /*res.json({
            id: user._id,
            usuario: user.username,
            direccion: user.direccion,
            visitas: user.visitas
        });*/
        res.redirect('/api/productos');
    } else {
        res.redirect('/index.html');
    }
}

module.exports = {
    getLogin,
    postLogin,
    getFailLogin,
    getSignUp,
    postSignUp,
    getFailSignUp,
    getLogout,
    getRutaProtegida,
    getDatos,
    failRoute
}