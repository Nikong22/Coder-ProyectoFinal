var admin = require("firebase-admin");

var serviceAccount = require("../coderfirebase.json");

const optionfirebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://api-coder-2e354.firebaseio.com"
});

console.log('Conectando a la base de datos Firebase...');
module.exports = { optionfirebase }