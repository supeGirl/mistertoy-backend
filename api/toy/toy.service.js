import {ObjectId} from 'mongodb'

import {dbService} from '../../services/db.service.js'
import {loggerService} from '../../services/logger.service.js'
import {utilService} from '../../services/util.service.js'

export const toyService = {
  query,
  get,
  remove,
  update,
  add,
  addToyMsg,
  removeToyMsg,
}

async function query(filterBy = {}) {
  try {
    const criteria = {}

    if (filterBy.txt) {
      criteria.name = {$regex: filterBy.txt, $options: 'i'}
    }

    if (filterBy.maxPrice && filterBy.maxPrice > 0) {
      criteria.price = {$lte: filterBy.maxPrice}
    }

    if (filterBy.inStock !== undefined && filterBy.inStock !== '') {
      const isInStock = filterBy.inStock === 'true'
      criteria.inStock = isInStock
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
      criteria.labels = {$in: filterBy.labels}
    }

    const sortOptions = {}
    const {sortBy} = filterBy
    if (sortBy?.type) {
      const sortDir = sortBy.desc === -1 ? -1 : 1; // Default to ascending
      sortOptions[sortBy.type] = sortDir;
  
    }
    const {pageIdx} = filterBy
    const PAGE_SIZE = 8
    const skip = pageIdx !== undefined ? +pageIdx * PAGE_SIZE : 0
    const limit = PAGE_SIZE

    const collection = await dbService.getCollection('toy_db')
    const toys = await collection.find(criteria).skip(skip).limit(limit).toArray()

    return toys
  } catch (err) {
    loggerService.error(`connot find toys ${err}`)
    throw err
  }
}

async function get(toyId) {
  try {
    const collection = await dbService.getCollection('toy_db')
    const toy = await collection.findOne({_id: ObjectId.createFromHexString(toyId)})
    if (!toy) {
      throw new Error(`Toy with ID ${toyId} not found`)
    }
    toy.createAT = toy._id.getTimestamp()
    return toy
  } catch (err) {
    loggerService.error(`error while finding toy ${toyId} , ${err}`)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy_db')
    const {deletedCount} = await collection.deletedOne({_id: ObjectId.createFromHexString(toyId)})
    return deletedCount
  } catch (err) {
    loggerService.error(`connot remove toy ${toyId} , ${err}`)
    throw err
  }
}

async function add(toy) {
  try {
    const collection = await dbService.getCollection('toy_db')
    const addedToy = await collection.insertOne(toy)
    return addedToy.ops[0]
  } catch (err) {
    loggerService.error(`connot add toy ${err}`)
    throw err
  }
}

async function update(toy) {
  try {
    const toyToSave = {
      name: toy.name,
      price: toy.price,
      inStock: toy.inStock,
    }
    const collection = await dbService.getCollection('toy_db')
    await collection.updateOne({_id: ObjectId.createFromHexString(toy._id)}, {$set: toyToSave})
    return toy
  } catch (err) {
    loggerService.error(`connot update toy ${toy._id}, ${err}`)
  }
}

async function addToyMsg(toyId, msg) {
  try {
    msg.id ='msg' + utilService.makeId()
    msg.createdAt = Date.now()

    const collection = await dbService.getCollection('toy_db')
    await collection.updateOne({_id: ObjectId.createFromHexString(toyId)}, {$push: {msgs: msg }})
    return msg
  } catch (err) {
    loggerService.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection('toy_db')
    await collection.updateOne({_id: ObjectId.createFromHexString(toyId)}, {$pull: {msgs: {id: msgId}}})
    return msgId
  } catch (err) {
    loggerService.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}
