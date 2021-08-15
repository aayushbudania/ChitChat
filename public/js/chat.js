const socket = io()

//elements
const $locButton = document.querySelector('#send-location')
const $msgForm = document.querySelector('#message-form')
const $msgFormInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')
const $message = document.querySelector('#message')

//templates
const msgTemplate = document.querySelector('#message-template').innerHTML
const locTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = () => {
      const $newMessage = $message.lastElementChild

      const newMessageSytles = getComputedStyle($newMessage)
      const newMessageMargin = parseInt(newMessageSytles.marginBottom)
      const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

      const visibleHeight = $message.offsetHeight
      const containerHeight = $message.scrollHeight
      const scrollOffset = $message.scrollTop+visibleHeight

      if(containerHeight - newMessageHeight <= scrollOffset){
            $message.scrollTop = $message.scrollHeight
      }
}

socket.on('message',(msg)=>{
      console.log(msg)
      const html = Mustache.render(msgTemplate,{
            username: msg.username,
            msg:msg.text,
            createdAt: moment(msg.createdAt).format('h:mm a') //moment library loaded in index.html  
      })
      $message.insertAdjacentHTML('beforeend',html)
      autoscroll()
})

socket.on('sendLocation',(url)=>{
      console.log(url)
      const html = Mustache.render(locTemplate,{
            username:url.username,
            loc:url.url,
            createdAt:moment(url.createdAt).format('h:mm a')
      })
      $message.insertAdjacentHTML('beforeend',html)
      autoscroll()
})

socket.on('roomMembers',({room,users})=>{
      const html = Mustache.render(sidebarTemplate,{
            room,
            users
      })
      document.querySelector('#sidebar').innerHTML = html
})

$msgForm.addEventListener('submit',(e)=>{
      e.preventDefault() // prevent automatic reload

      $msgFormButton.setAttribute('disabled','disabled')  // disabling button once clicked
      // const msg = document.querySelector('input').value  // text to be sent
      const msg = e.target.elements.message.value
      // console.log(msg)
      socket.emit('sendmsg',msg,(error)=>{ // sender will add callback ftn to wait for ack

            $msgFormButton.removeAttribute('disabled') // enabling button after sending msg
            $msgFormInput.value='' // clear input 
            $msgFormInput.focus()
            if(error){
                  return console.log(error)
                  // alert(error)
                  // location.href = '/'
            }
            console.log('Message Delivered')
      })
})

$locButton.addEventListener('click',()=>{
      if(!navigator.geolocation)
            return alert('Geolocation is not supported by your browser.')

      $locButton.setAttribute('disabled','disabled')

      navigator.geolocation.getCurrentPosition((position)=>{
            // console.log(position)
            socket.emit('sendLocation',{latitute:position.coords.latitude,longitude:position.coords.longitude}, (e)=>{
                  $locButton.removeAttribute('disabled')
                  if(e) return console.log('Could not send the location')
                  console.log('Location sent')
            })
      })
})

socket.emit('join',{username,room},(error)=>{
      if(error){
            alert(error)
            location.href = '/'
      }
})







// socket.on('countupdate',(count)=>{

//       // console.log('update from server:',count)
// })

// document.querySelector('#inccount').addEventListener('click',()=>{
//       console.log('clicked')
//       socket.emit('increament')
// })