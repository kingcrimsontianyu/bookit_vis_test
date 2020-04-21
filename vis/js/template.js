'use strict';

class Radial {

    // Vars
    w = 375;
    h = 375;

    constructor(_data, _ref) {
        this.data = JSON.parse(JSON.stringify(_data)).splice(0, 100);
        this.parent = _ref;

        this.initVis()
    }

    initVis() {
        // Get this vis
        const vis = this;

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

        // :^)
        vis.wrangleData();
    }

    wrangleData() {
        // Get this vis
        const vis = this;

        // :^)
        vis.updateVis();
    }

    updateVis() {
        // Get this vis
        const vis = this;
    }

}

