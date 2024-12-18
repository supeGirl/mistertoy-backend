import {toyService} from './toy.service.js'
import {loggerService} from '../../services/logger.service.js'

export async function getToys(req, res) {
  try {
    const filterBy = {
      txt: req.query.txt || '',
      maxPrice: +req.query.maxPrice || 0,
      labels: req.query.labels || [],
      inStock: req.query.inStock || '',
      pageIdx: isNaN(+req.query.pageIdx) ? 0 : +req.query.pageIdx,
    }

    const toys = await toyService.query(filterBy)

    res.json(toys)
  } catch (err) {
    loggerService.error('Error fetching toys:', err)
    res.status(500).send(`Cannot get toys: ${err.message}`)
  }
}

export async function getToyById(req, res) {
  const toyId = req.params.id
  
  try {
    const toy = await toyService.get(toyId)

    res.json(toy)
  } catch (err) {
    loggerService.error(`Faild to get toy, ${err}`)
    res.status(500).send({err: `Faild to get toy`})
  }
}

export async function addToy(req, res) {
  const {loggedinUser} = req

  try {
    const toy = req.body
    toy.owner = loggedinUser
    const addedToy = await toyService.add(toy)
    res.json(addedToy)
  } catch (err) {
    loggerService.error(`Faild to add toy, ${err}`)
    res.status(500).send({err: `Faild to add toy`})
  }
}

export async function updateToy(req, res) {
  try {
    const toy = {...req.body, _id: req.params.id}
    const updatedToy = await toyService.update(toy)
    res.json(updatedToy)
  } catch (err) {
    loggerService.error(`Faild to update toy, ${err}`)
    res.status(500).send({err: `Faild to update toy`})
  }
}

export async function removeToy(req, res) {
  try {
    const toyId = req.params.id
    const deletedCount = await toyService.remove(toyId)

    res.json(`${deletedCount} toys removed`)
  } catch (err) {
    loggerService.error(`Faild to delete toy, ${err}`)
    res.status(500).send({err: `Faild to delete toy`})
  }
}

export async function addToyMsg(req, res) {
  const {loggedinUser} = req
  
  try {
    const toyId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
      createdAt: Date.now(),
    }
    const savedMsg = await toyService.addToyMsg(toyId, msg)
    console.log(savedMsg, 'savedmsg');
    
    res.json(savedMsg)
  } catch (err) {
    loggerService.error('Failed to add massege', err)
    res.status(500).send({err: 'Failed to add massege'})
  }
}

export async function removeToyMsg(req, res) {
  try {
    const {id: toyId, msgId} = req.params
    console.log(toyId ,'toy id from delete msg controller');
    console.log(msgId ,'msg id from delete msg controller');
    

    const removedId = await toyService.removeToyMsg(toyId, msgId)
    res.send(removedId)
  } catch (err) {
    loggerService.error('Failed to remove toy msg', err)
    res.status(500).send({err: 'Failed to remove toy msg'})
  }
}
