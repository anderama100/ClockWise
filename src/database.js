const mongoose=require('mongoose');

const urlDB="mongodb+srv://anderama100:LJXXuxzR65MM7Gcz@clustercw-5mabe.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(urlDB).then(db=> console.log('DataBase Connected on MongoAtlas')).catch(err=>console.log(err));

module.exports=mongoose;