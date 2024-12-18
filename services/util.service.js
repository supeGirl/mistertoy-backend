import fs from 'fs/promises' // Use the promises API for async file operations

export const utilService = {
  readJsonFile,
  makeId,
}

async function readJsonFile(path) {
  try {
    const str = await fs.readFile(path, 'utf8') // Use fs.promises.readFile and pass encoding as 'utf8'
    const json = JSON.parse(str) // Parse the file content
    return json
  } catch (err) {
    console.error('Error reading JSON file:', err)
    throw new Error(`Failed to read JSON file at ${path}: ${err.message}`)
  }
}

function makeId(length = 5) {
  let text = ''
  const possible = '0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
