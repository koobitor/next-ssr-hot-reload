const chokidar = require('chokidar')
const express = require('express')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
global.app = next({ dev })
const handle = app.getRequestHandler()



app.prepare()
  .then(() => {
    const server = express()

    server.use(function (req, res, next) {
      require('./app/index.js')(req, res, next)
    })

    server.get('*', (req, res) => handle(req, res))

    const watcher = chokidar.watch('./app')

    watcher.on('ready', function() {
      watcher.on('all', function() {
        console.log("Clearing /dist/ module cache from server")
        Object.keys(require.cache).forEach(function(id) {
          if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id]
        })
      })
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })