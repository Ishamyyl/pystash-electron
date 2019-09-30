const { app, BrowserWindow } = require('electron')
const Datastore = require('nedb')
const fs = require('fs').promises
const fss = require('fs')
const https = require('https')
const util = require('util')
const { ipcMain } = require('electron')

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

  mainWindow.loadFile('static/index.html');
  mainWindow.maximize()

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    db.items.find({ typeLine: /Vaal Regalia/ }, (err, docs) => {
      mainWindow.send('stores.search_results.set', docs)
    })
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
    filename: 'tabs.db',
    autoload: true
  }),
  items: new Datastore({
    filename: 'items.db',
    autoload: true
  })
}

db.tabs.persistence.stopAutocompaction()

db.tabs.ensureIndex({ fieldName: 'i', unique: true })
db.tabs.ensureIndex({ fieldName: 'type' })

// fs.readFile('test.txt', { encoding: 'utf8' }).then(console.log)

// https.request({
//   "method": "GET",
//   "hostname": "www.pathofexile.com",
//   "path": `/character-window/get-stash-items?tabs=1&league=${league}&accountName=${accountName}`,
//   "headers": {
//     "cache-control": "no-cache",
//     "cookie": "POESESSID=f25aa310809af9a3fd621aaade499fc0;",
//   }
// }, resp => {
//   const chunks = [];
//   resp.on("data", chunk => {
//     chunks.push(chunk)
//   })
//   resp.on("end", () => {
//     db.tabs.insert(JSON.parse(Buffer.concat(chunks).toString()).tabs)
//   })
// }).end()

db.tabs.persistence.compactDatafile()

db.items.persistence.stopAutocompaction()

db.items.ensureIndex({ fieldName: 'id', unique: true })
db.items.ensureIndex({ fieldName: 'name' })

// for each of a particular stash tab type, asynchronously call API and insert into the DB
// db.tabs.find({ type: { $in: ["NormalStash", "PremiumStash", "QuadStash"] } }, { i: 1 }, (err, docs) => {
//   Promise.all(
//     docs.map(({ i }) => {
//       return new Promise((resolve, reject) => {
//         https.request({
//           "method": "GET",
//           "hostname": "www.pathofexile.com",
//           "path": `/character-window/get-stash-items?tabIndex=${i}&league=${league}&accountName=${accountName}`,
//           "headers": {
//             "cache-control": "no-cache",
//             "cookie": "POESESSID=f25aa310809af9a3fd621aaade499fc0;",
//           }
//         }, resp => {
//           const chunks = [];
//           resp.on("data", chunk => {
//             chunks.push(chunk)
//           })
//           // resp.on('error', reject)
//           resp.on("end", () => {
//             db.items.insert(JSON.parse(Buffer.concat(chunks).toString()).items)
//             resolve()
//           })
//         }).end()
//       })
//     })
//   ).then(_ => {
//     console.log('done')
//   }).catch(e => console.log('e', e))
// })

// ipcMain.on('test', (event, ...args) => {
//   console.log('e', event)
//   console.log('a', args)
// })

db.items.persistence.compactDatafile()

// function get_bytes_for_line_num(file_path, line_nums) {
//   return fs.readFile(file_path)
//     .then((data) => {
//       const out = {}
//       let n = 1
//       for (const [i, c] of data.entries()) {
//         if (line_nums.has(n) && !out[n]) out[n] = i
//         if (c === 0x0a) n++
//       }
//       return out
//     })
// }

// get_bytes_for_line_num('test.txt', new Set([2, 3]))

// function test(event, name) {
//   db.items.find({ name: new RegExp(name) }, (err, data) => {
//     mainWindow.send('set_item_list', data);
//   })
// }
// receive_ipc(test);

// function modify_line(file_path, str, byte) {
//   const line_bytes_mapping = get_bytes_for_line_num('test.txt', new Set([2, 3]))
//   fs.open(file_path, 'r+').then((fh) => {
//     fh.write(str, byte)
//     fh.close()
//   })
// }


// function update_filter_line_settings(event, options) {
//   get_bytes_for_line_num(options.file, new Set(Object.entries(options.lines).map(([k, v]) => v.line)))
//     .then((mapping) => {
//       for (const [category, rule] of Object.entries(options.lines)) {
//         modify_line(options.file, rule.show ? "Show" : "Hide", mapping[rule.line])
//       }
//     });
// }
// receive_ipc(update_filter_line_settings)
