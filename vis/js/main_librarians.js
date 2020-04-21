'use strict';

// radials
let bv;
let radial1, radial2, radial3, radial4, radial5, radial6;

d3.json('data/book-1696825.json').then(bd => {

    // Instantiate bookview
    bv = new BookView(bd, 'bookView');

}).catch(err => console.log(err));

// Load shared general data
d3.json('data/book-1696825_scrapy.json').then(bd => {

    // Get book data
    const dataBook = bd[0];

    // Tests
    d3.json(`data/librarians/scrapy-claudia_list_read.json`).then(d => {
        radial1 = new Radial(d, dataBook, 'radial1');
    }).catch(err => console.log(err));
    d3.json(`data/librarians/scrapy-jennifer_list_read.json`).then(d => {
        radial2 = new Radial(d, dataBook, 'radial2');
    }).catch(err => console.log(err));
    d3.json(`data/librarians/scrapy-katie_list_read.json`).then(d => {
        radial3 = new Radial(d, dataBook, 'radial3');
    }).catch(err => console.log(err));
    d3.json(`data/librarians/scrapy-meghan_list_read.json`).then(d => {
        radial4 = new Radial(d, dataBook, 'radial4');
    }).catch(err => console.log(err));
    d3.json(`data/librarians/scrapy-samantha_list_read.json`).then(d => {
        radial5 = new Radial(d, dataBook, 'radial5');
    }).catch(err => console.log(err));
    d3.json(`data/librarians/scrapy-sarah_list_read.json`).then(d => {
        radial6 = new Radial(d, dataBook, 'radial6');
    }).catch(err => console.log(err));



}).catch(err => console.log(err));

/*
 sortIt
 */
function sortIt(passthru) {
    radial1.sortIt(passthru.value);
    radial2.sortIt(passthru.value);
    radial3.sortIt(passthru.value);
    radial4.sortIt(passthru.value);
    radial5.sortIt(passthru.value);
    radial6.sortIt(passthru.value);
}