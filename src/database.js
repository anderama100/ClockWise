const mongoose=require('mongoose');

mongoose.connect(process.env.urlDB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

.then(db=> console.log('DataBase Connected on MongoAtlas')).catch(err=>console.log(err));

module.exports=mongoose;