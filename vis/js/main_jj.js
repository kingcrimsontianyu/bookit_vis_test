'use strict';

// radials
let radialZonaK, radialJeffB, radialJaredJ, radialNingC;

// Load shared general data
d3.json('data/scrapy-40180098.json').then(d => {

    // Get book data
    const dataBook = d[0];

    // Test : Zona Kostic
    d3.json(`data/scrapy-ZonaKostic.json`).then(d => {
        const data1 = d;
        radialZonaK = new Radial(data1, dataBook, 'radialZonaK');
    }).catch(err => console.log(err));

    // Test : Jeff Baglioni
    d3.json(`data/scrapy-JeffBaglioni.json`).then(d => {
        const data1 = d;
        radialJeffB = new Radial(data1, dataBook, 'radialJeffB');
    }).catch(err => console.log(err));

    // Test : Ning Chen
    d3.json(`data/scrapy-NingChen.json`).then(d => {
        const data1 = d;
        radialNingC = new Radial(data1, dataBook, 'radialNingC');
    }).catch(err => console.log(err));

    // Test : Jared Jessup
    d3.json(`data/scrapy-JaredJessup.json`).then(d => {
        const data1 = d;
        radialJaredJ = new Radial(data1, dataBook, 'radialJaredJ');
    }).catch(err => console.log(err));

}).catch(err => console.log(err));

/*
 sortIt
 */
function sortIt(passthru) {
    radialZonaK.sortIt(passthru.value);
    radialJeffB.sortIt(passthru.value);
    radialNingC.sortIt(passthru.value);
    radialJaredJ.sortIt(passthru.value);
}