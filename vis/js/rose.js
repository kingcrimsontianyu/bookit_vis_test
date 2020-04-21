'use strict';

class Rose {

    constructor(_data, _ref) {
        // this.dataRaw = _data;
        this.dataRaw = _data.slice(0, 100);

        // create a copy of raw data
        // to facilitate data manipulation
        this.data = [];
        this.dataRaw.forEach((el) => {
            this.data.push(el);
        });

        this.parent = _ref;

        this.userRatingMin = null;
        this.userRatingMax = null;
        this.numRatingsMin = null;
        this.numRatingsMax = null;
        this.syntheticLowerMin = null;
        this.syntheticUpperMax = null;
        this.normalizeData();

        this.initVis();
    }

    //------------------------------------------------------------
    // normalize user_rating and num_ratings to the range [1, 2] respectively
    // synthesize data: S = normalize(user_rating) +/- normalize(num_ratings) / 2
    //------------------------------------------------------------
    normalizeData() {
        const vis = this;

        // get extrema
        vis.userRatingMin = 1e10;
        vis.userRatingMax = -1e10;
        vis.numRatingsMin = 1e10;
        vis.numRatingsMax = -1e10;

        for(let i = 0; i < this.data.length; ++i)
        {
            let temp = parseFloat(vis.data[i]["user_rating"]);

            if(vis.userRatingMin > temp)
            {
                vis.userRatingMin = temp;
            }

            if(vis.userRatingMax < temp)
            {
                vis.userRatingMax = temp;
            }

            temp = parseFloat(vis.data[i]["num_ratings"]);

            if(vis.numRatingsMin > temp)
            {
                vis.numRatingsMin = temp;
            }

            if(vis.numRatingsMax < temp)
            {
                vis.numRatingsMax = temp;
            }
        }

        let myScaleUserRating = d3.scaleLinear()
                                    .domain([vis.userRatingMin, vis.userRatingMax])
                                    .range([1, 2]);

        let myScaleNumRatings = d3.scaleLinear()
                                    .domain([vis.numRatingsMin, vis.numRatingsMax])
                                    .range([1, 2]);

        // add normalized data
        for(let i = 0; i < vis.data.length; ++i)
        {
            vis.data[i]["user_rating_normalized"] = myScaleUserRating(parseFloat(vis.data[i]["user_rating"]));

            vis.data[i]["num_ratings_normalized"] = myScaleNumRatings(parseFloat(vis.data[i]["num_ratings"]));

            vis.data[i]["synthetic_lower"] = vis.data[i]["user_rating_normalized"] - vis.data[i]["num_ratings_normalized"] / 2;

            vis.data[i]["synthetic_upper"] = vis.data[i]["user_rating_normalized"] + vis.data[i]["num_ratings_normalized"] / 2;
        }

        // get extrema of synthetic data
        vis.syntheticLowerMin = 1e10;
        vis.syntheticUpperMax = -1e10;
        for(let i = 0; i < this.data.length; ++i)
        {
            let temp = this.data[i]["synthetic_lower"];

            if(vis.syntheticLowerMin > temp)
            {
                vis.syntheticLowerMin = temp;
            }

            temp = this.data[i]["synthetic_upper"];

            if(vis.syntheticUpperMax < temp)
            {
                vis.syntheticUpperMax = temp;
            }
        }
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
        vis.innerRadius = Math.round(vis.gW / 2 * 0.2);
        vis.outerRadius = Math.round(vis.gW / 2 * 0.9);

        // Build controlG
        vis.controlG = vis.g.append('g')
            .attr('class', 'controlG')
            .style('transform', `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);

        // Tianyu: not sure what this handle is used for
        // Add handle
        // vis.handleG = vis.controlG.append('g')
        //     .attr('class', 'controlG');
        // vis.handleG.append('circle')
        //     .attr('class', 'handleCirc')
        //     .attr('r', `${vis.gW / 2 * 0.85}`);
        // vis.handleHandle();

        // Build radialG
        vis.radialG = vis.g.append('g')
            .attr('class', 'radialG')
            .style('transform', `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);

        // Append rLabelG
        vis.rLabelG = vis.radialG.append('g')
            .attr('class', 'rLabelG');

        // Append circ
        /*vis.rLabelG.append('circle')
            .attr('class', 'rLabelCirc')
            .attr('r', vis.innerRadius);*/

        // Init xScale
        vis.xScale = d3.scaleLinear()
            .range([0, (2 * Math.PI)]);

        // Init yScale
        vis.yScale = d3.scaleLinear()
            .domain([vis.syntheticLowerMin, vis.syntheticUpperMax])
            .range([vis.innerRadius, vis.outerRadius]);

        // Define arcMaker
        vis.arcMaker = d3.arc()
                .padAngle(0.01);


        // Init
        vis.sort = 'user_rating';

        // :^)
        vis.wrangleData();
    }

    wrangleData() {
        // Get this vis
        const vis = this;

        // Sort
        if (vis.sort === 'abc') {
            vis.data.sort((a, b) => {
                if (a.hasOwnProperty('author') && b.hasOwnProperty('author')) {
                    const b_last = b.author.split(' ')[b.author.split(' ').length - 1];
                    const a_last = a.author.split(' ')[a.author.split(' ').length - 1];
                    if (a_last > b_last) {
                        return 1;
                    }
                    if (b_last > a_last) {
                        return -1;
                    }
                    return 0;
                }
            });
        } else {
            vis.data.sort((a, b) => {
                if (a.hasOwnProperty('user_rating') && b.hasOwnProperty('user_rating')) {
                    return +b.user_rating - +a.user_rating;
                }
            });

            console.log(vis.data);
        }

        // Update scales
        vis.xScale.domain([0, vis.data.length]);

        // :^)
        vis.updateVis();

    }

    updateVis() {
        // Get this vis
        const vis = this;

        // Add arcs
        vis.radialG.selectAll('.arcG')
            .data(vis.data, d => d.id)
            .join(
                // ENTER
                enter => enter
                    .append('g')
                    .attr('class', 'arcG')
                    .each(function(d, i) {
                        // Define this
                        const arcG = d3.select(this);

                        // Update arcMaker
                        vis.arcMaker
                            .innerRadius(vis.yScale(d["synthetic_lower"]))
                            .outerRadius(vis.yScale(d["synthetic_upper"]))
                            .startAngle(vis.xScale(i))
                            .endAngle(vis.xScale(i + 1));
                        // Append arc
                        arcG.append('path')
                            .attr('class', 'arc')
                            .attr('d', vis.arcMaker);
                    }),
                update => update
                    .each(function(d, i) {
                        // Define this
                        const arcG = d3.select(this);

                        // Update arcMaker
                        if (d.hasOwnProperty('synthetic_lower') &&
                            d.hasOwnProperty('synthetic_upper')) {
                            vis.arcMaker
                                .innerRadius(vis.yScale(d["synthetic_lower"]))
                            .outerRadius(vis.yScale(d["synthetic_upper"]))
                                .startAngle(vis.xScale(i))
                                .endAngle(vis.xScale(i + 1));
                            // Append arc
                            arcG.select('.arc')
                                .transition()
                                .attr('d', vis.arcMaker);
                        }
                    }),
                exit => exit.remove()
            )

    }

    // Tianyu: not sure what this handle is used for
    // handleHandle() {
    //     // Get this vis
    //     const vis = this;
    //
    //     // Handle Listeners
    //     vis.handleG.on('mouseover', hover);
    //
    //     function hover() {
    //     }
    //
    // }

    sortIt(by) {
        // Get this vis
        const vis = this;

        // Update sort
        vis.sort = by;

        // Wrangle
        vis.wrangleData();
    }


}