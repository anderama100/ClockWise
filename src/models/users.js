// Import Mongoose
const mongoose= require('mongoose');

const { Schema } = mongoose;

const UserSchema=new Schema({
    login: {type:String,require:true},
    encPassword: {type:String,require:true},
    firstName: {type:String,require:true},
    lastName: {type:String,require:true},
    lastLogin: {type:Date,require:false},
    locked: {type:Boolean,require:false}
}
);

module.exports=mongoose.model('UserSchema',UserSchema);