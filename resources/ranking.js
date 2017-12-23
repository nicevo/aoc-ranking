const DIMENSIONS = getWindowDimensions();
const WIDTH = DIMENSIONS.width;
const HEIGHT = DIMENSIONS.height - 100;

const INSETS = {'left': 225, 'right': 300, 'top': 30, 'bottom': 30};
const PADDING = {'left': 20, 'right': 20, 'top': 15, 'bottom': 15};

const TICK_MARK_LENGTH = 8;
const MEDAL_RADIUS = 5;

const SCALES = {};

var DIMMED_OPACITY = 0.3;
var HIGHLIGHT_OPACITY = 1.0;

const DAY_COUNT = 25

window.onload = function() {
    d3.json("data/ranking.json", function(data) {
        data.ranking.sort(function(a, b) {
            return a.overall_ranks[a.overall_ranks.length-1] - b.overall_ranks[b.overall_ranks.length-1];
        });

        visualize(data);
    });
};

function visualize(data) {
    configureScales(data);

    var vis = d3.select('#chart')
        .append('svg:svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

    addDayTickLines(vis, DAY_COUNT);

    addLabels(vis, DAY_COUNT, SCALES.y.range()[0] - PADDING.bottom, '0.0em', 'top');

    addRankingLines(vis, data);

    addNameLabels(vis, data, 'pole', SCALES.x(0) - PADDING.right, 'end')
        .attr('y', function (d) {
            return SCALES.y(d.overall_ranks[0]-1);
        });
    addNameLabels(vis, data, 'flag', SCALES.x(DAY_COUNT+1) + PADDING.left, 'start')
            .attr('y', function (d, i) {
            return SCALES.y(i);
        });

    // addMedals(vis, data);
}

function configureScales(data) {
    SCALES.x = d3.scale.linear()
        .domain([0, DAY_COUNT])
        .range([INSETS.left, WIDTH - INSETS.right]);

    SCALES.y = d3.scale.linear()
        .domain([0, data.ranking.length - 1])
        .range([INSETS.top, HEIGHT - INSETS.bottom]);

    SCALES.clr = d3.scale.category20();
}

function highlight(vis, name) {
    vis.selectAll('polyline')
        .style('opacity', function(d) {
            return d.name == name ? HIGHLIGHT_OPACITY : DIMMED_OPACITY;
        });

    vis.selectAll('circle')
        .style('opacity', function(d) {
            return d.name == name ? HIGHLIGHT_OPACITY : DIMMED_OPACITY;
        });

    vis.selectAll('text.label')
        .style('opacity', function(d) {
            return d.name == name ? HIGHLIGHT_OPACITY : DIMMED_OPACITY;
        });
}

function unhighlight(vis) {
    vis.selectAll('polyline')
        .style('opacity', HIGHLIGHT_OPACITY);
    vis.selectAll('circle')
        .style('opacity', HIGHLIGHT_OPACITY);
    vis.selectAll('text.label')
        .style('opacity', HIGHLIGHT_OPACITY);
}

function addDayTickLines(vis, dayCount) {
    vis.selectAll('line.tickLine')
        .data(SCALES.x.ticks(dayCount))
        .enter().append('svg:line')
        .attr('class', 'tickLine')
        .attr('x1', function(d) {
            return SCALES.x(d + 0.5);
        })
        .attr('x2', function(d) {
            return SCALES.x(d + 0.5);
        })
        .attr('y1', SCALES.y.range()[0] - TICK_MARK_LENGTH)
        .attr('y2', SCALES.y.range()[1] + TICK_MARK_LENGTH)
        .attr('visibility', function(d) {
            return d <= dayCount ? 'visible' : 'hidden'
        });
}

function addLabels(vis, data, y, dy, cssClass) {
    vis.selectAll('text.day.' + cssClass)
        .data(SCALES.x.ticks(data))
        .enter().append('svg:text')
        .attr('class', 'day ' + cssClass)
        .attr('x', function(d) {
            return SCALES.x(d);
        })
        .attr('y', y)
        .attr('dy', dy)
        .attr('text-anchor', 'middle')
        .text(function(d, i) {
            return i > 0 ? i : '';
        });
}

function addRankingLines(vis, days) {
    vis.selectAll('polyline.ranking')
        .data(days.ranking)
        .enter()
        .append('svg:polyline')
        .attr('class', 'ranking')
        .attr('points', function(d) {
            var points = [];
            for (var i = 1; i <= d.overall_ranks.length; i++) {
                points[i] = SCALES.x(i) + ',' + SCALES.y(d.overall_ranks[i-1] - 1);
            }
            return points.join(' ');
        })
        .style('stroke', function(d) {
            return SCALES.clr(d.overall_ranks[0]);
        })
        .on('mouseover', function(d) {
            highlight(vis, d.name);
        })
        .on('mouseout', function() {
            unhighlight(vis);
        });
}

function addNameLabels(vis, data, cssClass, x, textAnchor) {
    return vis.selectAll('text.label.' + cssClass)
        .data(data.ranking)
        .enter()
        .append('svg:text')
        .attr('class', 'label ' + cssClass)
        .attr('x', x)
        .attr('dy', '0.35em')
        .attr('text-anchor', textAnchor)
        .text(function(d) {
            return d.name;
        })
        .style('fill', function(d) {
            return SCALES.clr(d.overall_ranks[0]);
        })
        .on('mouseover', function(d) {
            highlight(vis, d.name);
        })
        .on('mouseout', function() {
            unhighlight(vis);
        });
}

function addMedals(vis, data) {
    // console.log(vis, data)
    vis.selectAll("circle.medal")
        .data(data.ranking)
        .enter()
        .append("svg:circle")
        .attr("class", "medal")
        .attr("cx", function(d, i) {
            console.log(d, i)
            return SCALES.x(i+1);
        })
        .attr("cy", function(d, i) {
            // console.log(d, i, d.overall_ranks[i])
            return SCALES.y(d.overall_ranks[i] - 1);
        })
        .attr("r", MEDAL_RADIUS)
        .attr('visibility', function(d, i) {
            // return (i in d.rank_per_day) ? 'visible' : 'hidden'
            return 'visible';
        })
        .style("fill", function(d, i) {
            if (d.ranks[i] == 1) {
                return "gold"
            }
            else if (d.ranks[i] == 2) {
                return "silver"
            }
            else if (d.ranks[i] == 3) {
                return "#963"
            }
            return SCALES.clr(d.start);
        })
        .on('mouseover', function(d) {
            highlight(vis, d.name);
        })
        .on('mouseout', function() {
            unhighlight(vis);
        });

    // Place text.
    vis.selectAll("text.label.medal")
        .data(data)
        .enter()
        .append("svg:text")
        .attr("class", "label medal")
        .attr("x", function(d, i) {
            return SCALES.x(i+1);
        })
        .attr("y", function(d, i) {
            return SCALES.y(d.overall_ranks[i] - 1);
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d, i) {
            // half circle: &#9686;
            return d.ranks[i];
        })
        .on('mouseover', function(d) {
            highlight(vis, d.name);
        })
        .on('mouseout', function() {
            unhighlight(vis);
        });
}

function getWindowDimensions() {

    var width = 630;
    var height = 460;
    if (document.body && document.body.offsetWidth) {

        width = document.body.offsetWidth;
        height = document.body.offsetHeight;
    }

    if (document.compatMode == 'CSS1Compat' && document.documentElement && document.documentElement.offsetWidth) {

        width = document.documentElement.offsetWidth;
        height = document.documentElement.offsetHeight;
    }

    if (window.innerWidth && window.innerHeight) {

        width = window.innerWidth;
        height = window.innerHeight;
    }

    return {'width': width, 'height': height};
}
