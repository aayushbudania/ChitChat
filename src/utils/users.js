const users = []

const addUser = ({ id, username, room }) =>{
      //remove extra spaces 
      username = username.trim().toLowerCase()
      room = room.trim().toLowerCase()

      //check existence of username and room
      if(!username || !room){
            return {
                  'error':'Username of password not provided'
            }
      }

      //check uniqueness of username
      const duplicateUser = users.find((user)=>{
            return room === user.room && username === user.username
      })
      if(duplicateUser)
            return {
                  'error': 'Username already exists'
            }

      //store and return user object
      const user = {id, username, room}
      users.push(user)
      return {user}
}

const removeUser = (id)=>{
      const index = users.findIndex((user) => user.id === id)

      if(index !== -1) // if user is found
            return users.splice(index,1)[0]
      return {
            'error': 'user not exists'
      }
}

const getUser = (id) =>{
      return users.find((user) => {
            return user.id === id
      })
}

const getUsersInRoom = (room) => {
      // room = room.trim().toLowerCase()
      return users.filter((user) => user.room === room)
}

module.exports = {
      addUser,
      removeUser,
      getUser,
      getUsersInRoom
}