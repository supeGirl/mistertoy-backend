import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import {loggerService} from './services/logger.service.js'
import {toyService} from './services/toy.service.js'

const app = express()

const corsOptions = {
  origin: [
    'http://127.0.0.1:8080',
    'http://localhost:8080',

    'http://localhost:5173',
    'http://127.0.0.1:5173',

    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
}
// App Configuration
app.use(express.static('public'))
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
app.use(cors(corsOptions))

// **************** Toys API ****************:
// GET toys
app.get('/api/toy', (req, res) => {
  const {txt, inStock = null, pageIdx, sortBy, labels = []} = req.query

  // Ensure sortBy is valid
  let parsedSortBy = null
  if (sortBy) {
    try {
      parsedSortBy = JSON.parse(sortBy)
    } catch (err) {
      loggerService.error('Invalid sortBy format:', err)
    }
  }

  const filterBy = {
    txt,
    inStock,
    pageIdx: +pageIdx || 0,
    sortBy: parsedSortBy,
    labels: Array.isArray(labels) ? labels : [labels].filter(Boolean),
  }

  toyService
    .query(filterBy)
    .then((toys) => {
      res.send(toys)
    })
    .catch((err) => {
      loggerService.error(`Error fetching toy with ID ${toyId}:`, err)
      res.status(500).send(`Cannot get toy: ${err.message}`)
    })
})

app.get('/api/toy/:toyId', (req, res) => {
  const {toyId} = req.params

  toyService
    .get(toyId)
    .then((toy) => {
      res.send(toy)
    })
    .catch((err) => {
      loggerService.error('Cannot get toy', err)
      res.status(500).send(err)
    })
})

app.post('/api/toy', (req, res) => {
  const {name, price, labels} = req.body
  const toy = {
    name,
    price: +price,
    labels,
  }

  toyService
    .save(toy)
    .then((savedToy) => {
      res.send(savedToy)
    })
    .catch((err) => {
      loggerService.error('Cannot add toy', err)
      res.status(500).send('Cannot add toy')
    })
})

app.put('/api/toy', (req, res) => {
  const {name, price, _id, labels} = req.body
  const toy = {
    _id,
    name,
    price: +price,
    labels,
  }

  toyService
    .save(toy)
    .then((savedToy) => {
      res.send(savedToy)
    })
    .catch((err) => {
      loggerService.error('Cannot update toy', err)
      res.status(500).send('Cannot update toy')
    })
})

app.delete('/api/toy/:toyId', (req, res) => {
  const {toyId} = req.params

  toyService
    .remove(toyId)
    .then((msg) => {
      res.send({msg, toyId})
    })
    .catch((err) => {
      loggerService.error(`Error deleting toy with ID ${toyId}:`, err)
      res.status(500).send(`Cannot delete toy: ${err.message}`)
    })
})

// Fallback
app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

// Listen will always be the last line in our server!
const port = 3030
app.listen(port, () => {
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})
