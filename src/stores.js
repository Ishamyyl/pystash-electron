import { writable } from 'svelte/store';
const { ipcRenderer } = require("electron");

function persistent(key, initial) {
    const store = writable(JSON.parse(localStorage.getItem(key)) || initial, () => {
        return store.subscribe(value => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    });

    return store;
}

export const test = persistent("test", "");
ipcRenderer.on('stores.test.set', function (event, data) {
    console.log('fromsend', event)
    test.set(data)
});
console.log('on');

export default persistent;