(function connect(){
  let socket = io.connect('http://192.168.0.13:3000')

  let username = document.querySelector('#username')
  let usernameBtn = document.querySelector('#usernameBtn')
  let curUsername = document.querySelector('.card-header')
  let resultBtns = document.querySelector('.result-btns')

  let sessionUsername = null

  usernameBtn.addEventListener('click', e => {
    console.log(username.value)
    socket.emit('change_username', {username: username.value})
    curUsername.textContent = username.value
    sessionUsername = username.value
    username.value = ''
  })

  const removes = () => {
    document.getElementsByClassName('adminInp')[0].remove()
    document.getElementById('login').remove()
    document.getElementById('close').remove()
  }

  document.getElementById('room-name').addEventListener('click', e => {
    e.preventDefault();

    if(!document.body.contains(document.getElementsByClassName('adminInp')[0]) && !document.getElementById('close') && !document.getElementById('login') && !document.getElementById('show')){
      let inp = document.createElement('input')
      inp.classList.add('adminInp')

      let login = document.createElement('button')
      login.setAttribute('id', 'login')
      login.innerHTML = 'give me admin powwa'
      login.addEventListener('click', ev => {
        const val = document.getElementsByClassName('adminInp')[0].value

        socket.emit('i_am', {pass: val})
      })

      let close = document.createElement('button')
      close.setAttribute('id', 'close')
      close.innerHTML = 'Close'
      close.addEventListener('click', () => {
        console.log("yeet")

        removes()
      })

      curUsername.append(inp)
      curUsername.append(login)
      curUsername.append(close)
    }
  })

  socket.on('noPower', data => {
    alert('no admin for u')
    removes()
  })

  socket.on('isAdmin', data => {
    removes()
    // show admin buttons
    let show = document.createElement('button')
    show.classList.add('btn')
    show.classList.add('btn-success')
    show.setAttribute('id', 'show')
    show.innerHTML = 'Show Results!'
    show.addEventListener('click', e => {
      socket.emit('show_results')
    })


    let clear = document.createElement('button')
    clear.classList.add('btn')
    clear.classList.add('btn-success')
    clear.innerHTML = 'Clear Results'
    clear.addEventListener('click', e => {
      socket.emit('clear_results')

      // return everyones buttons
      socket.emit('give_back_buttons')
    })

    resultBtns.append(show)
    resultBtns.append(clear)
  })

  let message = document.querySelector('#message')
  let messageBtn = document.querySelector('#messageBtn')
  let messageList = document.querySelector('#message-list')

  messageBtn.addEventListener('click', e => {
      console.log(message.value)
      socket.emit('new_message', {message: message.value})
      message.value = ''
  })

  socket.on('receive_message', data => {
      console.log(data)
      let listItem = document.createElement('li')
      listItem.textContent = data.username + ': ' + data.message
      listItem.classList.add('list-group-item')
      messageList.appendChild(listItem)
  })

  let info = document.querySelector('.info')

  message.addEventListener('keypress', e => {
      socket.emit('typing')
  })

  socket.on('typing', data => {
      info.textContent = data.username + " is typing..."
      setTimeout(() => {info.textContent=''}, 5000)
  })



  // create poll btn elements
  const generatePolls = num => {
    if(!document.body.contains(document.getElementsByClassName('btns-box')[0])){
      let bBox = document.createElement('div')
      bBox.classList.add('btns-box')

      document.querySelector(".parent-btns-box").append(bBox)
    }

    let p1 = document.createElement('button')
    let p2 = document.createElement('button')
    let p3 = document.createElement('button')
    let p4 = document.createElement('button')
    let p5 = document.createElement('button')

    p1.innerHTML = '1'
    p2.innerHTML = '2'
    p3.innerHTML = '3'
    p4.innerHTML = '4'
    p5.innerHTML = '5'

    p1.classList.add('btn')
    p1.classList.add('btn-success')
    p2.classList.add('btn')
    p2.classList.add('btn-success')
    p3.classList.add('btn')
    p3.classList.add('btn-success')
    p4.classList.add('btn')
    p4.classList.add('btn-success')
    p5.classList.add('btn')
    p5.classList.add('btn-success')

    p1.addEventListener('click', e => {
      document.querySelector('.btns-box').remove()
      socket.emit('vote', {poll: "1"})
    })
    p2.addEventListener('click', e => {
      document.querySelector('.btns-box').remove()
      socket.emit('vote', {poll: "2"})
    })
    p3.addEventListener('click', e => {
      document.querySelector('.btns-box').remove()
      socket.emit('vote', {poll: "3"})
    })
    p4.addEventListener('click', e => {
      document.querySelector('.btns-box').remove()
      socket.emit('vote', {poll: "4"})
    })
    p5.addEventListener('click', e => {
      document.querySelector('.btns-box').remove()
      socket.emit('vote', {poll: "5"})
    })

    document.querySelector('.btns-box').append(p1)
    document.querySelector('.btns-box').append(p2)
    document.querySelector('.btns-box').append(p3)
    document.querySelector('.btns-box').append(p4)
    document.querySelector('.btns-box').append(p5)
  }

  // initialize first poll btns
  generatePolls()

  // when admin clears resutls, give people back their poll btns
  socket.on('unhide_my_buttons', data => {
    generatePolls()
  })

  let resultBox = document.getElementById('results')

  socket.on('send_results', data => {
    console.log('send_results')
    let highestArr = []

    // show who voted for what
    for(let p in data){
      var i = 0
      if(data[p].length > 0){
        let res = document.createElement('div')
        res.textContent = `${p} voted by ${data[p]}.`

        resultBox.append(res)

        // this will try to add up scores for people voting in the majority
        if(data[p].length > highestArr.length){
          console.log('send_results2', data[p], 'username', sessionUsername)
          highestArr = [...data[p]]
        }
      }
      i++
    }

    // if their name is in the most voted poll they get points!
    if(highestArr.includes(sessionUsername)){
      console.log('add score emitted!!')
      socket.emit('add_score')
    }

    // find longest array
    // check if username is in there


  })

  socket.on('clear_result_text', data => {
    resultBox.textContent = ''
    console.log("bigyeets", data.peeps)
  })

})()
