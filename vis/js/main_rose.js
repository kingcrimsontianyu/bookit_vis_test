'use strict';

d3.json("data/scrapy-sarah_list_read.json").then(d => {
    const data2 = JSON.parse(JSON.stringify(d));
    let roseChart = new Rose(data2, 'roseChartUser');
}).catch(err => console.log(err));