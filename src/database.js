const mongoose=require('mongoose');
// URL de conexion a la base de datos de Mongo en CloudMongo
// usuario en Atlas andres.rivera@nvalue.com.co clave Soporte123
const urlDB="mongodb+srv://anderama100:LJXXuxzR65MM7Gcz@clustercw-5mabe.mongodb.net/test?retryWrites=true&w=majority";
// Establecer conexion con Mongo en Cloud
mongoose.connect(urlDB).then(db=> console.log('Base de Datos Mongo Conectada en MongoAtlas')).catch(err=>console.log(err));
// Exportar configuracion
module.exports=mongoose;