const getMessages = (username, text) =>{
      return {
            username,
            text,
            createdAt : new Date().getTime()
      }
}

const getLocMessages = (username, url) =>{
      return {
            username,
            url,
            createdAt: new Date().getTime()
      }
}

module.exports = {
      getMessages,
      getLocMessages
}