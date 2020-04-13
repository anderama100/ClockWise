// Import Mongoose
const mongoose= require('mongoose');

const { Schema } = mongoose;

const AppointmentSchema=new Schema({
    login: {type:String,require:true},
    dateFormated: {type:String,require:true},
    date: {type:Date,require:true},
    title: {type:String,require:true},
    description: {type:String,require:false},
    active: {type:Boolean,require:false},
    color: {type:String,require:true},
}
);

module.exports=mongoose.model('AppointmentSchema',AppointmentSchema);