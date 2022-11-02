const express = require("express");
const bCrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { obtenerUsuario, obtenerUsuarioId, passwordValida } = require('./utils/util');
const router = require('./router');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MensajeDB = require('./models/mensajes')
const { SocketAddress } = require('net');
const rutas = require('./router');
const routes = require("./api/productos");
const carritos = require('./api/carrito');
const User = require('./models/users')
require('dotenv').config({ path: __dirname + '/.env' })
const logger = require('./logger');
const { fork } = require('child_process');
const cluster = require('cluster');
const fs = require('fs');
var fileupload = require("express-fileupload");
var cookieParser = require('cookie-parser');
const { productosDao, carritosDao } = require('./api/dao/daos');

const app = express();
const PORT = process.env.PORT;

app.use(fileupload());
let FORK_O_CLUSTER = 'FORK'

var server = require("http").createServer(app)
const io = require('socket.io')(server);
io.on('connection', (socket) => {
});

const numCPUs = require('os').cpus().length
if (FORK_O_CLUSTER == 'FORK') {
  server.listen(PORT, () => logger.info(`Servidor HTTP escuando en el puerto ${PORT}`));
} else {
  if (cluster.isMaster) {
    console.log(`master ${process.pid} running`)
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`)
    })
  } else {
    console.log(`worker ${process.pid} started`)
    server.listen(PORT, () => logger.info(`Servidor HTTP escuando en el puerto ${PORT}`));
  }
}

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: false,
  // cookie: { maxAge: 5000 }
}));
app.set('views', './views'); // especifica el directorio de vistas
app.set('view engine', 'hbs'); // registra el motor de plantillas
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use("/api", routes)
app.use("/api", carritos)

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials"
  })
);

app.use('/', (req, res, next) => {
  express.static('public')(req, res, next);
});

app.get('/test', (req, res) => {
  res.send('Server levantado...');
});

app.get('/login', rutas.getLogin);
app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), rutas.postLogin);
app.get('/faillogin', rutas.getFailLogin);

app.get('/signup', rutas.getSignUp);
app.post('/signup', passport.authenticate('signup', { failureRedirect: '/failsignup' }), rutas.postSignUp);
app.get('/failsignup', rutas.getFailSignUp);

app.get('/logout', rutas.getLogout);

app.get('/ruta-protegida', checkAuthentication, rutas.getRutaProtegida);

app.get('/datos', rutas.getDatos);
app.post('/upload_avatar', uploadAvatar);
app.get('*', rutas.failRoute);

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated() && req.cookies.username) {
    next();
  } else {
    res.redirect('/');
  }
}

passport.use('login', new LocalStrategy({
  passReqToCallback: true
},
  function (req, username, password, done) {
    User.findOne({ 'username': username },
      async function (err, user) {
        if (err)
          return done(err);
        if (!user) {
          // console.log('user not found ' + username);
          logger.error('user not found ' + username)
          return done(null, false,
            // console.log('message', 'user not found'));
            logger.error('message', 'user not found'))
        }
        if (!isValidPassword(user, password)) {
          // console.log('Invalid password');
          logger.error('Invalid password')
          return done(null, false,
            // console.log('mensage', 'Invalid Password'));
            logger.error('mensage', 'Invalid Password'))
        }
        return done(null, user);
      }
    );
  })
);

const isValidPassword = function (user, password) {
  return bCrypt.compareSync(password, user.password);
}

passport.use('signup', new LocalStrategy({
  passReqToCallback: true
},
  function (req, username, password, done) {
    findOrCreateUser = function () {
      User.findOne({ 'username': username }, function (err, user) {
        if (err) {
          // console.log('Error en SignUp: ' + err);
          logger.error('Error en SignUp: ' + err)
          return done(err);
        }
        if (user) {
          // console.log('User already exists');
          logger.info('User already exists');
          return done(null, false,
            // console.log('message', 'User Already Exists'));
            logger.info('message', 'User Already Exists'));
        } else {
          var newUser = new User();
          newUser.username = username;
          newUser.password = createHash(password);
          /*newUser.firstName = req.body.firstName;
          newUser.lastName = req.body.lastName;*/
          newUser.name = req.body.name;
          newUser.surname = req.body.surname;
          newUser.phone = req.body.phone;
          newUser.save(function (err) {
            if (err) {
              // console.log('Error in Saving user: ' + err);
              logger.error('Numero uno o numero dos no es un numero')
              throw err;
            }
            // console.log('User Registration succesful');
            logger.info('User Registration succesful');
            return done(null, newUser);
          });
        }
      });
    }
    process.nextTick(findOrCreateUser);
  })
)
var createHash = function (password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}


passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

function uploadAvatar(req, res) {
  const username = req.user.username
  const pathAvatar = './public/uploads/'
  User.findOne({ 'username': username },
    function (err, user) {
      if (err) {
        logger.error(err)
        throw err;
      }
      user.thumbnail = req.files.thumbnail.name;
      user.save(function (err) {
        if (err) {
          logger.error(err)
          throw err;
        }
        fs.writeFile(pathAvatar + req.files.thumbnail.name, req.files.thumbnail.data, function (err) {
          res.cookie('avatar', '/uploads/' + req.files.thumbnail.name, { signed: false, maxAge: 500000 });
          res.cookie('username', username, { signed: false, maxAge: 500000 });
          res.redirect('/api/productos');
        });
      });
    }
  );
}

io.on('connection', async (socket) => {
  let mensajes = await MensajeDB.find({}).then((mensajes) => {
    return mensajes
  })
  io.sockets.emit('mensajes', mensajes);

  socket.on('mis_mensajes', async (data) => {
      let mis_mensajes = await MensajeDB.find({'autor': data.autor }).then((mensajes) => {
        return mensajes
      })
      io.sockets.emit('mis_mensajes', mis_mensajes);
  })

  socket.on('nuevo', (data) => {
    MensajeDB.insertMany([data])
      .then((id_insertado) => {
        mensajes['id'] = id_insertado[0];
        mensajes.push(data);
        io.sockets.emit('mensajes', mensajes);
      });
  })

});