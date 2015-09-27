var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

var oracledb = require('oracledb')
var dbConfig = require('./public/connect/dbconfig.js')

app.use(express.static('public'))

http.listen(80, function () {
  console.log('listening on *:80')
})

io.on('connection', function (socket) {
  socket.on('addUser', function (data) {
    io.emit('push', data)
  })
})

var connec

oracledb.getConnection(
  {
    user: dbConfig.user,
    password: dbConfig.password,
    connectString: dbConfig.connectString
  },
  function (err, connection) {
    if (err) {
      console.error(err.message)
      return
    }
    connec = connection

  })

app.get('/user', function (req, res) {
  connec.execute(
    'SELECT * FROM people ', [],
    { outFormat: oracledb.OBJECT },
    function (err, result) {
      if (err) {
        console.error(err.message)
        res.send(err.message)
        return
      }
      res.send(result.rows)
    })

})

app.post('/user', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  res.send(req.body)
/*connec.execute(
  'INSERT INTO people VALUES (:id, :nm, :sm)',
  [req.body.ID, req.body.NAME, req.body.SURNAME],
  function (err, result) {
    if (err) { console.error(err.message); return; }
    console.log('Rows inserted: ' + result.rowsAffected)

    res.send(req.body)

    connec.execute('commit',
      function (err, result) {
        if (err) { console.error(err.message); return; }
      })
  })*/
})

app.put('/user', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  console.log(req.body)

  connec.execute(
    'UPDATE people SET name = :nm,surname = :sm WHERE id = :id',
    [req.body.NAME, req.body.SURNAME, req.body.ID],
    function (err, result) {
      if (err) { console.error(err.message); return; }
      console.log('Rows updated: ' + result.rowsAffected)

      res.send(req.body)

      connec.execute('commit',
        function (err, result) {
          if (err) { console.error(err.message); return; }
        })
    })
})

app.delete('/user/:id', function (req, res) {
  res.send(req.param('id'))
  connec.execute(
    'DELETE FROM people WHERE id = :id',
    [req.param('id')], // Bind values
    function (err, result) {
      if (err) { console.error(err.message); return; }
      console.log('Rows deleted: ' + result.rowsAffected)

      connec.execute('commit',
        function (err, result) {
          if (err) { console.error(err.message); return; }
        })
    })
})
