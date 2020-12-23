const auth = require("../../auth.json");
const firebase = require('firebase/app');
require('firebase/database');

const firebaseApp = firebase.initializeApp(auth.firebaseConfig);

module.exports = firebaseApp.database();