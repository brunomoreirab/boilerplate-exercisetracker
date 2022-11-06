const express = require('express')
const cors = require('cors')
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const services = require('./services');
const utils = require('./utils');
const { count } = require('console');
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//configure mongoose
mongoose.connect(process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
    }
  }
);

// Home
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Busca todos os usuários
app.get('/api/users', async (req,res) => {
  console.log('\nGET /api/users - Buscando todos os usuários.');

  try {
    const allUsers = await services.getAllUsers();
    res.json(allUsers)
  } catch (err) {
    res.status(500).json({error: err.message});
  };
});

// Busca um usuário específico
app.get('/api/users/:_id/logs', async (req,res) => {
  console.log(`\nGET /api/users/:_id/logs - Buscando os logs do usuário de ID ${req.params._id}.`);

  // Recebe os parametros da request
  let {from, to, limit} = req.query;
  const userId = req.params._id;
  
  // Cria as datas, caso existam. Caso não existam, estabelece limites padrões
  let dateFrom = new Date(from);
  let dateTo = new Date(to);

  if (dateFrom == 'Invalid Date') {
    dateFrom = new Date(1800,1,1);
  }

  if (dateTo == 'Invalid Date') {
    dateTo = new Date(2100,1,1);
  }
  
  // Busca o usuário
  try {
    const allLogsUser = await services.getLogsUser(userId);
    
    // Verifica se o usuário foi encontrado
    if(!allLogsUser) {
      console.log('Usuário não encontrado!');
      return res.json({error: 'Usuário não encontrado!'})
    };

    // Remove o campo _id dos logs e filtra de acordo com as datas
    let logs = allLogsUser.log;
    let filteredLogs = logs.reduce((filtered, log) => {
      if(log.date >= dateFrom && log.date <= dateTo) {
        filtered.push({
          description: log.description, 
          duration: log.duration, 
          //dateUTC: log.date.toUTCString().replace(',', '').substring(0, 15),
          date: utils.dateFormater(log.date.toUTCString())
        });
      }
      return filtered;
    }, []);

    // Aplica o limite de logs
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    // Constrói e envia a resposta
    responseObj = {
      _id: allLogsUser._id,
      username: allLogsUser.username,
      count: allLogsUser.count,
      log: filteredLogs
    };
    res.json(responseObj);
  } catch (err) {
    console.log("Erro na busca")
    res.status(500).json({error: err.message});
  };
});

// Cria o usuário
app.post('/api/users', async (req, res) => {
  console.log(`\nPOST /api/users - username: ${req.body.username}`)
  const username = req.body.username;
  try {
    // Verifica se o usuário já existe
    const user = await services.checkUser(username);
    
    // Se o usuário já existe, retorna o seu registro
    if (user) {
      console.log('Usuário já cadastrado!')

      // Constrói e envia a resposta
      const responseObj = {
        username: user.username,
        _id: user._id
      }
      res.json(responseObj)
    // Se não existe, cria o usuário
    } else {
      const newUser = await services.createUser(username);
      
      // Constrói e envia a resposta
      const responseObj = {
        username: newUser.username,
        _id: newUser._id
      };
      res.json(responseObj);
    }
  } catch (err) {
    res.status(500).json({error: err.message});
  };
});

// Loga um exercício
app.post('/api/users/:_id/exercises', async (req,res) => {
  console.log(`\nPOST /api/users/:_id/ date: ${req.body.date}`)

  // Converte a string de data para Date
  let date = req.body.date;
  if (date === '') {
    date = new Date()
  } else {
    date = new Date(date);
  };

  // Verifica se o formato é válido ou não, e constrói o objeto de resposta
  if (date == 'Invalid Date') {
    // console.log('Formato inválido!')
    // return res.json({error: 'Date format is invalid'});
    date = new Date()
  }
  
  try {
    const upsert = await services.registerExercise(
      req.params._id,
      req.body.description,
      parseInt(req.body.duration),
      date
    );

    const log = upsert.log[upsert.log.length -1];
    
    // Constrói e envia a resposta
    const responseObj = {
      _id: upsert._id,
      username: upsert.username,
      //date: log.date.toUTCString().replace(',', '').substring(0, 15),
      date: utils.dateFormater(log.date.toUTCString()),
      duration: log.duration,
      description: log.description
    }
    res.json(responseObj);
  } catch (err) {
    res.status(500).json({error: err.message});
  };

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
