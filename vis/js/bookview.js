class BookView {

    constructor(_data, _ref) {
        this.data = JSON.parse(JSON.stringify(_data)).book;
        this.parent = _ref;

        this.initVis()
    }

    initVis() {
        // Get this vis
        const vis = this;

        // Get container and config
        vis.div = d3.select(`#${vis.parent}`);

        // Create els
        vis.bookCover = vis.bookView.append('img')
            .attr('id', 'bookCover');
        const bookInfo = vis.bookView.append('div')
            .attr('id', 'bookInfo');
        vis.bookTitle = bookInfo.append('h2')
            .attr('id', 'bookTitle')
            .attr('class', 'infoText');
        vis.bookAuthor = bookInfo.append('h2')
            .attr('id', 'bookAuthor')
            .attr('class', 'infoText');
        vis.bookLink = bookInfo.append('a')
            .attr('id', 'bookLink')
            .attr('class', 'infoText')
            .attr('target', '_blank')
            .text('More at Goodreads');

        // :^)
        vis.wrangleData();
    }

    wrangleData() {
        // Get this vis
        const vis = this;
        console.log(vis.data);

        // :^)
        vis.updateVis();
    }

    updateVis() {
        // Get this vis
        const vis = this;

        //
        vis.bookCover.datum(vis.data)
            .attr('src', d => d.image_url)
            .attr('alt', d => d.title);
        vis.bookTitle.datum(vis.data)
            .text(d => d.title);
        vis.bookAuthor.datum(vis.data)
            .text(d => d.hasOwnProperty('authors') ? d.authors.author.name : '');
        vis.bookLink.datum(vis.data)
            .attr('href', d => d.link);
    }

}

