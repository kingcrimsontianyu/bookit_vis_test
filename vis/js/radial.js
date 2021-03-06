'use strict';

class Radial {

    constructor(_data, _dataBook, _ref) {
        this.data = JSON.parse(JSON.stringify(_data));
        this.dataBook = _dataBook.book;
        this.parent = _ref;

        // Append book to data
        const appenD = JSON.parse(JSON.stringify(this.dataBook));
        this.data.push(appenD);

        // :^)
        this.initVis()
    }

    initVis() {
        // Get this vis
        const vis = this;

        // Config
        vis.w = 375;
        vis.h = 375;

        // Get container and config
        vis.svg = d3.select(`#${vis.parent}`)
            .append('svg')
            .attr('width', vis.w)
            .attr('height', vis.h);

        // Config g
        vis.gMargin = {top: 0, right: 0, bottom: 0, left: 0};
        vis.gW = vis.w - (vis.gMargin.right + vis.gMargin.left);
        vis.gH = vis.h - (vis.gMargin.top + vis.gMargin.bottom);

        // Build g
        vis.g = vis.svg.append('g')
            .style('transform', `translate(${vis.gMargin.left}px ${vis.gMargin.right}px`);

        // Config radialG
        vis.innerRadius = Math.round(vis.gW / 2 * 0.45);
        vis.outerRadius = Math.round(vis.gW / 2 * 0.8);

        // Build controlG
        vis.controlG = vis.g.append('g')
            .attr('class', 'controlG')
            .style('transform', `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);

        // Add handle
        vis.handleG = vis.controlG.append('g')
            .attr('class', 'controlG');
        vis.handleG.append('circle')
            .attr('class', 'handleCirc')
            .attr('r', `${vis.gW / 2 * 0.85}`);
        vis.handleHandle();

        // Build radialG
        vis.radialG = vis.g.append('g')
            .attr('class', 'radialG')
            .style('transform', `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);

        // Append rLabelG
        vis.rLabelG = vis.radialG.append('g')
            .attr('class', 'rLabelG');

        // Append circ
        vis.rLabelG.append('circle')
            .attr('class', 'rLabelCirc')
            .attr('r', vis.innerRadius);

        vis.rLabelG.append('text')
            .attr('class', 'rLabelText rLabelText1')
            .style('transform', `translate(${-vis.gW / 2 + 10}px, ${-vis.gH / 2 + 20}px)`);

        // Append rAreaG
        vis.rAreaG = vis.radialG.append('g')
            .attr('class', 'rAreaG');

        // Init xScale
        vis.xScale = d3.scaleLinear()
            .range([0, (2 * Math.PI)]);

        // Init yScale
        vis.yScale = d3.scaleLinear()
            .range([vis.innerRadius, vis.outerRadius]);

        // Init areaMaker
        vis.areaMaker = d3.areaRadial()
            .curve(d3.curveCatmullRomClosed)
            .innerRadius(vis.innerRadius)
            .outerRadius(d => vis.yScale(d.value))
            .angle(d => vis.xScale(d.index));

        // Config coordScale
        vis.coordScale = d3.scaleLinear()
            .range([Math.PI, -Math.PI]);

        // Build contourG
        vis.contoursG = vis.g.append('g')
            .attr('class', 'contoursG')
            .style('transform', `translate(${vis.gW / 2 - vis.innerRadius}px, ${vis.gH / 2 - vis.innerRadius}px)`);
        vis.contoursG.append('circle')
            .attr('cx', vis.innerRadius)
            .attr('cy', vis.innerRadius)
            .attr('r', vis.innerRadius)
            .attr('fill', 'rgba(255, 255, 255)');
        vis.contoursG.append('defs')
            .append('clipPath')
            .attr('id', `contour-clip-${vis.parent}`)
            .append('circle')
            .attr('cx', vis.innerRadius)
            .attr('cy', vis.innerRadius)
            .attr('r', vis.innerRadius);
        // Config genreClipPath
        vis.genreClipPath = vis.contoursG.append('defs')
            .append('clipPath')
            .attr('id', `genre-clip-${vis.parent}`)
            .append('path')
            .style('transform', `translate(${vis.innerRadius}px, ${vis.innerRadius}px)`);

        // Build geoG
        vis.geosG = vis.g.append('g')
            .attr('class', 'geosG')
            .style('transform', `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);

        // Init contour
        vis.contours = d3.contourDensity();

        // Init colorScale
        vis.colorScale = d3.scaleLinear()
            .range(['rgb(255, 0, 128)', 'rgb(0, 0, 255)']);

        // Config
        vis.dotG = 3;

        // Init
        vis.sort = 'abc';

        // :^)
        vis.wrangleData();
    }

    wrangleData() {
        // Get this vis
        const vis = this;

        // Genre data
        const genre = [];
        vis.data.forEach(d => {
            d.genres.forEach(dd => {
                genre.push({genre: dd})
            })
        });
        vis.genreData = d3.nest()
            .key(d => d.genre).sortKeys(d3.ascending)
            .rollup(v => v.length)
            .entries(genre);

        // Sort
        if (vis.sort === 'abc') {
            vis.genreData.sort((a, b) => b.key - a.key);
        } else if (vis.sort === '123') {
            vis.genreData.sort((a, b) => b.value - a.value);
        } else {
            vis.genreData.sort((a, b) => b.value - a.value);

            // Right-left
            let placeholderA = [];
            let placeholderB = [];
            vis.genreData.forEach((d, i) => {
                if (i === 0 || i % 2 === 0) {
                    placeholderA.push(d);
                } else {
                    placeholderB.unshift(d);
                }
            });
            vis.genreData = [...placeholderA, ...placeholderB];
        }

        // Update scale (pre)
        vis.coordScale.domain([0, vis.genreData.length]);
        vis.yScale.domain([0, d3.max(vis.genreData, d => d.value)]);

        // Set some new properties
        vis.genreData.forEach((d, i) => {
            d.index = i;
            // Get coords
            d.x = Math.round(vis.innerRadius * Math.sin(vis.coordScale(i)));
            d.y = Math.round(vis.innerRadius * Math.cos(vis.coordScale(i)));
        });

        // Update scales (post)
        vis.xScale.domain([0, d3.max(vis.genreData, d => d.index) + 1]);

        // Filter out entries with no genre and reduce genres to sets
        vis.bookData = vis.data.filter(d => d.hasOwnProperty('genres') && d.genres.length !== 0);
        vis.displayData.forEach(d => {
            if (d.hasOwnProperty('genres')) {
                d.genres = new Set(d.genres);
            }
        });

        // Init geoMaker
        vis.geoMaker = d3.line()
            .curve(d3.curveLinearClosed);

        // :^)
        vis.updateVis();

    }

    updateVis() {
        // Get this vis
        const vis = this;

        // Centroid collection
        vis.centroids = [];

        // Draw radial area path
        vis.rAreaG.selectAll('.areaPath')
            .data([{area: vis.genreData}])
            .join(
                enter => enter
                    .append('path')
                    .attr('class', 'areaPath')
                    .attr('d', d => vis.areaMaker(d.area)),
                update => update
                    .transition()
                    .attr('d', d => vis.areaMaker(d.area)),
                exit => exit.remove()
            );

        // Update genre count text
        vis.rLabelG.select('.rLabelText1')
            .text(`Books: ${vis.data.length} / Genres: ${vis.genreData.length}`);

        // Draw geos
        vis.geosG.selectAll('.geoG')
            .data(vis.displayData, d => d.key)
            .join(
                // ENTER
                enter => enter
                    .append('g')
                    .attr('class', 'geoG')
                    .each(function (d) {
                        // Get this geoG
                        const geoG = d3.select(this);
                        // Collect genres
                        const genres = [];
                        d.genres.forEach(g => {
                            const currentGenre = vis.genreData.find(cg => {
                                if (cg.hasOwnProperty('key')) {
                                    return cg.key === g;
                                }
                            });
                            genres.push(currentGenre);
                        });
                        // Sort by index
                        genres.sort((a, b) => a.index - b.index);
                        // Add to coords
                        const coords = [];
                        genres.forEach(g => {
                            coords.push([g.x, g.y]);
                        });
                        // Update clipping path
                        if (d.id === vis.dataBook.id) {
                            vis.genreClipPath.attr('d', vis.geoMaker(coords));
                        }
                        // Draw path
                        geoG.append('path')
                            .attr('class', () => {
                                if (d.id === vis.dataBook.id) {
                                    return 'geoPathBook';
                                }
                                return 'geoPath';
                            })
                            .attr('d', vis.geoMaker(coords));
                        // Draw node circles
                        genres.forEach(g => {
                            geoG.append('circle')
                                .attr('class', () => {
                                    if (d.id === vis.dataBook.id) {
                                        return 'geoNodeBook';
                                    }
                                    return 'geoNode';
                                })
                                .attr('r', vis.dotG)
                                .attr('cx', g.x)
                                .attr('cy', g.y)
                        });
                        // Get center of polygon
                        const centroid = d3.polygonCentroid(coords);
                        let infinity = false;
                        if (centroid[0] === Infinity || centroid[0] === -Infinity || centroid[1] === Infinity
                            || centroid[1] === -infinity) {
                            infinity = true;
                        }
                        const bypass = true;
                        if (centroid[0] && centroid[1] && !infinity && !bypass) {
                            centroid[0] = Math.round(centroid[0]);
                            centroid[1] = Math.round(centroid[1]);
                            // Draw circ
                            geoG.append('circle')
                                .attr('class', () => {
                                    if (d.id === vis.dataBook.id) {
                                        return 'geoCircBook';
                                    }
                                    return 'geoCirc';
                                })
                                .attr('r', vis.dotG)
                                .attr('cx', centroid[0])
                                .attr('cy', centroid[1]);
                            vis.centroids.push({x: centroid[0], y: centroid[1]});
                        } else {
                            // Calc circ ave coords
                            const xAve = Math.round(coords.map(d => d[0]).reduce((a, c) => a + c) / coords.length);
                            const yAve = Math.round(coords.map(d => d[1]).reduce((a, c) => a + c) / coords.length);
                            // Draw circ
                            geoG.append('circle')
                                .attr('class', () => {
                                    if (d.id === vis.dataBook.id) {
                                        return 'geoCircBook';
                                    }
                                    return 'geoCirc';
                                })
                                .attr('r', vis.dotG)
                                .attr('cx', xAve)
                                .attr('cy', yAve);
                            vis.centroids.push({x: xAve, y: yAve});
                        }

                    }),
                // UPDATE
                update => update
                    .each(function (d) {
                        // Get this geoG
                        const geoG = d3.select(this);
                        // Collect genres
                        const genres = [];
                        d.genres.forEach(g => {
                            const currentGenre = vis.genreData.find(cg => {
                                if (cg.hasOwnProperty('key')) {
                                    return cg.key === g;
                                }
                            });
                            genres.push(currentGenre);
                        });
                        // Sort by index
                        genres.sort((a, b) => a.index - b.index);
                        // Add to coords
                        const coords = [];
                        genres.forEach(g => {
                            coords.push([g.x, g.y]);
                        });
                        // Update clipping path
                        if (d.id === vis.dataBook.id) {
                            vis.genreClipPath.attr('d', vis.geoMaker(coords));
                        }
                        // Draw path
                        geoG.select('.geoPath')
                            .attr('d', vis.geoMaker(coords));
                        // Draw node circles
                        genres.forEach(g => {
                            geoG.selectAll('.geoNode')
                                .attr('cx', g.x)
                                .attr('cy', g.y)
                        });
                        // Get center of polygon
                        const centroid = d3.polygonCentroid(coords);
                        let infinity = false;
                        if (centroid[0] === Infinity || centroid[0] === -Infinity || centroid[1] === Infinity
                            || centroid[1] === -infinity) {
                            infinity = true;
                        }
                        const bypass = true;
                        if (centroid[0] && centroid[1] && !infinity && !bypass) {
                            centroid[0] = Math.round(centroid[0]);
                            centroid[1] = Math.round(centroid[1]);
                            // Draw circ
                            geoG.select('.geoCirc')
                                .transition()
                                .attr('cx', centroid[0])
                                .attr('cy', centroid[1]);
                            vis.centroids.push({x: centroid[0], y: centroid[1]});
                        } else {
                            // Calc circ ave coords
                            const xAve = Math.round(coords.map(d => d[0]).reduce((a, c) => a + c) / coords.length);
                            const yAve = Math.round(coords.map(d => d[1]).reduce((a, c) => a + c) / coords.length);
                            // Draw circ
                            geoG.select('.geoCirc')
                                .transition()
                                .attr('cx', xAve)
                                .attr('cy', yAve);
                            vis.centroids.push({x: xAve, y: yAve});
                        }

                    })
            )
            .on('mouseover', function (d) {
                // Clear selections
                /*vis.g.select('.geoPathSel')
                    .classed('geoPathSel', false);
                vis.g.select('.geoCircSel')
                    .classed('geoCircSel', false);
                vis.g.selectAll('.geoNodeSel')
                    .classed('geoNodeSel', false);
                // Define this
                const g = d3.select(this);
                // Show path and outline circ
                g.select('.geoPath')
                    .classed('geoPathSel', true);
                g.select('.geoCirc')
                    .classed('geoCircSel', true);
                g.selectAll('.geoNode')
                    .classed('geoNodeSel', true);*/
            });

        // TODO
        vis.buildContour();
    }

    handleHandle() {
        // Get this vis
        const vis = this;

        // Handle Listeners
        vis.handleG.on('mouseover', hover);

        function hover() {
        }

    }

    sortIt(by) {
        // Get this vis
        const vis = this;

        // Update sort
        vis.sort = by;

        // Wrangle
        vis.wrangleData();
    }

    /*
    buildContour
     */
    buildContour() {
        // Define this
        const vis = this;

        // Vars
        const wh = vis.innerRadius * 2;

        // Get coords
        const results = vis.contours
            .x(d => d.x + vis.innerRadius)
            .y(d => d.y + vis.innerRadius)
            .size([wh, wh])
            .bandwidth(20)
            .thresholds(10)
            (vis.centroids);
        vis.colorScale.domain([0, results.length - 1]);

        // Draw
        vis.contoursG.selectAll('.contourG')
            .data(results)
            .join(
                enter => enter
                    .append('g')
                    .attr('class', 'contourG')
                    .attr('clip-path', `url(#contour-clip-${vis.parent})`)
                    .each(function (d, i) {
                        // Define
                        const contourG = d3.select(this);
                        // Append shape
                        contourG.append('path')
                            .attr('class', 'transContour')
                            .attr('d', d3.geoPath())
                            .style('opacity', '0.25')
                            .attr('fill', vis.colorScale(i));
                        // Append shape
                        contourG.append('path')
                            .attr('class', 'contour')
                            .attr('d', d3.geoPath())
                            .attr('clip-path', `url(#genre-clip-${vis.parent})`)
                            .attr('fill', vis.colorScale(i));
                    }),
                update => update
                    .each(function (d, i) {
                        // Define
                        const contourG = d3.select(this);
                        // Append shape
                        contourG.select('.transContour')
                            .attr('d', d3.geoPath())
                            .style('opacity', '0.25')
                            .attr('fill', vis.colorScale(i));
                        // Append shape
                        contourG.select('.contour')
                            .attr('d', d3.geoPath())
                            .attr('clip-path', `url(#genre-clip-${vis.parent})`)
                            .attr('fill', vis.colorScale(i));
                    }),
                exit => exit.remove().transition()
            );


    }


}

/*
Ref.
https://github.com/d3/d3-contour/blob/v1.3.2/README.md#contours
https://observablehq.com/@d3/density-contours?collection=@d3/d3-contour
 */