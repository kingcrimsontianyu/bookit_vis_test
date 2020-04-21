'use strict';

// Global vars
let similarityChartManager;
// let similarityChartDataSource = "data/scrapy-40180098-test.json";
let similarityChartDataSource = "data/scrapy-52379-with-year.json";
// Load shared general data
/*d3.json('').then(d => {

}).catch(err => console.log(err));*/

/*
 sortIt
 */
function sortIt(passthru) {

}

//------------------------------------------------------------
// implementation of similarity chart manager
// everything here is local without polluting global namespace
//------------------------------------------------------------
{ // start scope

function SimilarityChartManager(dataSourceLocation) {
    this.dataSourceLocation = dataSourceLocation;
    this.rawData = null;
    this.myBookList = null;
    this.processedMyBookList = null;

    this.mySvg = null;
    this.myRootNode = null;

    this.mySvgWidth = null;
    this.mySvgHeight = null;

    this.numRows = 5;
    this.numCols = 5;

    this.boxWidth = 0;
    this.boxHeight = 0;

    this.myGroups = null;
    this.myBoxes = null;

    this.myMargin = 2;

    this.myColorScale = null;

    this.minRating = 1e6;
    this.maxRating = -1e6;

    this.minYear = 1e6;
    this.maxYear = -1e6;

    this.myXScale = null;
    this.myYScale = null;
    this.myColorScale = null;

    //------------------------------------------------------------
    // return an array of length numElements such that
    // the first element is start, the last element is stop
    //------------------------------------------------------------
    this.generateRange = (start, stop, numElements) => {
        let increment = (stop - start) / (numElements - 1);
        let result = new Array(numElements);
        for(let i = 0; i < numElements; ++i)
        {
            result[i] = start + i * increment;
        }
        return result;
    };

    this.analyzeData = () => {
        this.processedMyBookList = this.myBookList;

        // cast ave_rating to numerical
        for(let i = 0; i < this.processedMyBookList.length; ++i) {
            this.processedMyBookList[i]["ave_rating"] = parseFloat(this.processedMyBookList[i]["ave_rating"]);
        }

        // sort books in ascending order of ave_rating
        this.processedMyBookList.sort((a, b) => {
            if (a["ave_rating"] < b["ave_rating"]) {
                return -1;
            }
            if (a["ave_rating"] > b["ave_rating"]) {
                return 1;
            }
            // a must be equal to b
            return 0;
        });

        // move target book to the end of the data
        // to ensure it be plotted the last and always
        // located on the top
        let targetBook = this.processedMyBookList.find((el) => {
            return el["internal_type"] == "target";
        });

        if(targetBook) {
            let tempArray = [];

            for(let i = 0; i < this.processedMyBookList.length; ++i) {
                if(this.processedMyBookList[i]["internal_type"] != "target") {
                    tempArray.push(this.processedMyBookList[i]);
                }
            }

            tempArray.push(targetBook);

            this.processedMyBookList = tempArray;
        }

        // get min max year
        for(let i = 0; i < this.processedMyBookList.length; ++i) {
            if(this.minYear > this.processedMyBookList[i]["publication_year"])
            {
                this.minYear = this.processedMyBookList[i]["publication_year"];
            }

            if(this.maxYear < this.processedMyBookList[i]["publication_year"])
            {
                this.maxYear = this.processedMyBookList[i]["publication_year"];
            }
        }

        // get min max rating
        for(let i = 0; i < this.processedMyBookList.length; ++i) {
            if(this.minRating > this.processedMyBookList[i]["ave_rating"])
            {
                this.minRating = this.processedMyBookList[i]["ave_rating"];
            }

            if(this.maxRating < this.processedMyBookList[i]["ave_rating"])
            {
                this.maxRating = this.processedMyBookList[i]["ave_rating"];
            }
        }

        console.log(this.processedMyBookList);
        console.log(this.minYear);
        console.log(this.maxYear);
        console.log(this.minRating);
        console.log(this.maxRating);

        this.boxWidth = this.mySvgWidth / this.numCols;
        this.boxHeight = this.mySvgHeight / this.numRows;

        this.myColorScale = d3.scaleLinear()
                            .domain([this.minRating, this.maxRating])
                            .range(['#00b894', '#ff7675'])
                            .interpolate(d3.interpolateRgb);

        this.myXScale = d3.scaleQuantile() // continuous input domain, discrete output range
                            .domain([this.minYear, this.maxYear])
                            .range(this.generateRange(0, this.numCols - 1, this.numCols));

        this.myYScale = d3.scaleQuantile() // continuous input domain, discrete output range
                            .domain([this.minRating, this.maxRating])
                            .range(this.generateRange(0, this.numRows - 1, this.numRows));

        this.myColorScale = d3.scaleLinear()
                            .domain(this.generateRange(this.minRating, this.maxRating, this.numRows))
                            .range([d3.color("#092516"),
                                    d3.color("#017A01"),
                                    d3.color("#8D9104"),
                                    d3.color("#FDD90E"),
                                    d3.color("#DE130A")
                            ])
                            .interpolate(d3.interpolateHcl);
    };

    this.initializeChart = () => {
        d3.json(this.dataSourceLocation).then((rawData) => {
            this.rawData = rawData;

            // extract list of similar books from raw data
            let temp = this.rawData.slice(1, this.rawData.length);

            this.myBookList = temp.map((el) => {
                return el["similar_book"];
            });

            // mark books as similar books
            for(let i = 0; i < this.myBookList.length; ++i) {
                this.myBookList[i]["internal_type"] = "similar";
            }

            // add target book
            this.myBookList.push(this.rawData[0]["book"]);

            // mark books as target book
            this.myBookList[this.myBookList.length - 1]["internal_type"] = "target";

            // calculate width and height of the svg such that
            // the svg fill all the area provided by mobileScreen
            this.myRootNode = document.querySelector("#mobileScreen");
            let compStyle = window.getComputedStyle(this.myRootNode);
            this.mySvgWidth = this.myRootNode.clientWidth -
                                parseInt(compStyle.paddingLeft.replace("px", "")) -
                                parseInt(compStyle.paddingRight.replace("px", ""));
            this.mySvgHeight = this.myRootNode.clientHeight -
                                parseInt(compStyle.paddingTop.replace("px", "")) -
                                parseInt(compStyle.paddingBottom.replace("px", ""));

            this.analyzeData();

            this.mySvg = d3.select("#mobileScreen")
                            .append("svg")
                            .attr("width", this.mySvgWidth)
                            .attr("height", this.mySvgHeight);

            this.myGroups = this.mySvg
                                .selectAll("g")
                                .data(this.processedMyBookList)
                                .enter()
                                .append("g");

            this.myBoxes = this.myGroups
                                .selectAll("rect")
                                .data(this.processedMyBookList)
                                .enter()
                                .append("rect")
                                .attr("x", (d) => {
                                    let result = this.myXScale(d["publication_year"]) * this.boxWidth + this.myMargin;
                                    return result;
                                })
                                .attr("y", (d) => {
                                    let result = this.myYScale(d["ave_rating"]) * this.boxHeight + this.myMargin;
                                    return result;
                                })
                                .attr("width", this.boxWidth - 2 * this.myMargin)
                                .attr("height", this.boxHeight - 2 * this.myMargin)
                                .attr("fill", (d) => {
                                    let myColor = this.myColorScale(d["ave_rating"]);
                                    return myColor;
                                })
                                .attr("stroke", (d) => {
                                    if(d["internal_type"] == "target")
                                    {

                                        return "#000000";
                                    }
                                    else
                                    {
                                        return "none";
                                    }
                                })
                                .attr("stroke-width", 2);
        })
        .catch((err) => console.log(err));
    };
}

similarityChartManager = new SimilarityChartManager(similarityChartDataSource); // specify data source
similarityChartManager.initializeChart();


} // end scope