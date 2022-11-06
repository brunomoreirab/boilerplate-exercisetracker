const { describe } = require('node:test');

const User = require('./mongo-models').UserModel;
const Exercise = require('./mongo-models').ExerciseModel;

// Checa a existência de um usuário
exports.checkUser = async (username) => {
    console.log(`Buscando o usuário ${username}`);
    return await User.findOne({username: username});
};

// Cria um usuário
exports.createUser = async (username) => {
    console.log(`Criando o usuário ${username}`);
    const objUser = {
        username: username,
        count: 0
    };
    return await User.create(objUser);
};

// Busca todos os usuários
exports.getAllUsers = async () => {
    return await User.find({}, "_id username");
}

// // Busca todos os logs de um usuário
// exports.getLogsUser = async (_id) => {
//     console.log(`getsLogsUser ${_id}`)
//     return await User.findById(_id);
// }

// Busca todos os logs de um usuário
exports.getLogsUser = async (_id) => {
    console.log(`getsLogsUser ${_id}`)
    return await User.findById(_id);
}

// Registra um novo log
exports.registerExercise = async(_id, description, duration, date) => {
    console.log(`Registrando: \n_id: ${_id}\ndescription: ${description} \nduration: ${duration} \ndate: ${date}`);

    const newExercise = new Exercise({
        description: description,
        duration: duration,
        date: date
    });

    return await User.findOneAndUpdate(
        {_id: _id}, 
        {$push: {log: newExercise}, $inc: {count: 1}},
        {new: true});
}