const axios = require('axios');
const db = require('../database/dbConfig')
const { authenticate,generateToken } = require('./middlewares');
const bcrypt = require('bcryptjs')

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const { username, password } = req.body
  const user = { username, password }
  const hash = bcrypt.hashSync(user.password, 14)
  user.password = hash
  db('users').insert(user)
    .then( response => {
      console.log(response)
        const id = response[0]
        db('users').where({ id })
          .then( response => {
            console.log('response', response )
            const token = generateToken(response)
             res.status(200).json(token)
          })
          .catch(err => {
            res.status(404).json({ error : err })
          })
    })
    .catch(err => {
         res.status(500).json({ error: err})
    })
  
}

function login(req, res) {
  // implement user login
  const { username, password } =  req.body;
  const user = { username , password }
  db('users').where(username).first()
    .then( response => {
      if(response && bcrypt.compareSync(user.password, response.password)){
        const token = generateToken(user)
        res.status(200).json(token)
      }
    })
    .catch( error => {
      res.status(404).json({error : error })
    })
}

function getJokes(req, res) {
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}

