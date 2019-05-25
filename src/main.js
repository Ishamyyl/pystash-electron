const { app, BrowserWindow } = require('electron')
const Datastore = require('nedb')
const fs = require('fs').promises
const https = require('https')
const util = require('util')

let mainWindow

const league = 'standard'
const accountName = 'Ishamyyl'

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    },
    // backgroundColor: '#251515',
    show: false
  })

  mainWindow.loadFile('static/index.html')
  mainWindow.maximize()

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

const db = {
  tabs: new Datastore({
    filename: 'db.tabs.json',
    autoload: true
  }),
  items: new Datastore({
    filename: 'db.items.json',
    autoload: true
  })
}

db.tabs.persistence.stopAutocompaction()

db.tabs.ensureIndex({ fieldName: 'i', unique: true })
db.tabs.ensureIndex({ fieldName: 'type' })

// fs.readFile('test.txt', { encoding: 'utf8' }).then(console.log)

https.request({
  "method": "GET",
  "hostname": "www.pathofexile.com",
  "path": `/character-window/get-stash-items?tabs=1&league=${league}&accountName=${accountName}`,
  "headers": {
    "cache-control": "no-cache",
    "cookie": "POESESSID=8e3956244b1dcc9ee5e5c7654c84125f;",
  }
}, resp => {
  const chunks = [];
  resp.on("data", chunk => {
    chunks.push(chunk)
  })
  resp.on("end", () => {
    db.tabs.insert(JSON.parse(Buffer.concat(chunks).toString()).tabs)
  })
}).end()

db.tabs.persistence.compactDatafile()

db.items.persistence.stopAutocompaction()

db.items.ensureIndex({ fieldName: 'id', unique: true })
db.items.ensureIndex({ fieldName: 'name' })

// for each of a particular stash tab type, asynchronously call API and insert into the DB
db.tabs.find({ type: { $in: ["NormalStash", "PremiumStash", "QuadStash"] } }, { i: 1 }, (err, docs) => {
  Promise.all(
    docs.map(({ i }) => {
      return new Promise((resolve, reject) => {
        https.request({
          "method": "GET",
          "hostname": "www.pathofexile.com",
          "path": `/character-window/get-stash-items?tabIndex=${i}&league=${league}&accountName=${accountName}`,
          "headers": {
            "cache-control": "no-cache",
            "cookie": "POESESSID=8e3956244b1dcc9ee5e5c7654c84125f;",
          }
        }, resp => {
          const chunks = [];
          resp.on("data", chunk => {
            chunks.push(chunk)
          })
          // resp.on('error', reject)
          resp.on("end", () => {
            db.items.insert(JSON.parse(Buffer.concat(chunks).toString()).items)
            resolve()
          })
        }).end()
      })
    })
  ).then(_ => {
    console.log('done')
  }).catch(e => console.log('e', e))
})

db.items.persistence.compactDatafile()
