const admin = require('firebase-admin');
const dotenv = require('dotenv') 
dotenv.config() // Makes environment variables available

var serviceAccount = require(`${process.env.SERVICE_ACCOUNT}`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


let database = admin.firestore()
let databaseAuth = admin.auth()

database.settings({ ignoreUndefinedProperties: true })

module.exports = {
  databaseAuth,
  database
} 