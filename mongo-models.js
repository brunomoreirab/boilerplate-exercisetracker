mongoose = require('mongoose')

let exerciseSchema = new mongoose.Schema({
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: Date, required: true}
});

let userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  count: {type: Number, required: true},
  log: [exerciseSchema]
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
const User = mongoose.model('User', userSchema);

exports.UserModel = User
exports.ExerciseModel = Exercise
