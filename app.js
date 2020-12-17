const express = require('express')
const socketio = require('socket.io')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

const server = app.listen (process.env.PORT || 3000, () => {
  console.log("server is running")
})

const io = socketio(server)

var poll1 = []
var poll2 = []
var poll3 = []
var poll4 = []
var poll5 = []

var players = []

io.on('connection', socket => {
  console.log("New user connected")

  socket.username = "Anonymous"
  // socket.score = 0

  socket.on('change_username', data => {
    socket.username = data.username

    // add the player
    players.push({
      name: data.username,
      score: 0
    })
  })

  // handle the new message event
  socket.on('new_message', data => {
    console.log("new message")
    io.sockets.emit('receive_message', {message: data.message, username: socket.username})
  })

  socket.on('typing', data => {
    socket.broadcast.emit('typing', {username: socket.username})
  })

  socket.on('take_del', data => {
    console.log(`${socket.username} accepted this delivery`)
    io.sockets.emit('confirm_accept_del', {username: socket.username})
  })

  socket.on('vote', data => {
    switch (data.poll) {
      case "1":
        poll1.push(socket.username)
        break
      case "2":
        poll2.push(socket.username)
        break
      case "3":
        poll3.push(socket.username)
        break
      case "4":
        poll4.push(socket.username)
        break
      case "5":
        poll5.push(socket.username)
        break
      default:
        console.log('no')
    }
    // console.log(`${socket.username} voted poll 1! ${poll1Count}`)

    // io.sockets.emit('confirm_accept_del', {username: socket.username})
  })

  socket.on('show_results', data => {
    io.sockets.emit('send_results', {
      poll1: poll1,
      poll2: poll2,
      poll3: poll3,
      poll4: poll4,
      poll5: poll5
    })
  })
  socket.on('clear_results', data => {
    poll1 = []
    poll2 = []
    poll3 = []
    poll4 = []
    poll5 = []
    io.sockets.emit('clear_result_text', {peeps: players})
  })

  socket.on('give_back_buttons', data => {
    io.sockets.emit('unhide_my_buttons')
  })

  //admin privelages
  socket.on('i_am', data => {
    if(data.pass === '12345678'){
      io.sockets.emit('isAdmin')
    } else {
      io.sockets.emit('noPower')
    }
  })

  // scores
  socket.on('add_score', data => {
    console.log("addScore", socket.username)
    // socket.score++

    // find them in the player array and increment their score
    players.forEach(p => {
      if(p.name === socket.username){
        p.score++
      }
    })
  })
})
