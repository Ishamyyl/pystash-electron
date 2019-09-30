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

export const search_results = persistent("search_results", "");
ipcRenderer.on('stores.search_results.set', function (event, data) {
    search_results.set(data)
});

export default persistent;