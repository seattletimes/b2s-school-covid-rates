// var paywall = require("./lib/paywall");
// setTimeout(() => paywall(12345678), 5000);

require("component-responsive-frame/child");
const d3 = require("d3");

var graphWidth = document.getElementById('graph').offsetWidth;
var graphHeight = document.getElementById('graph').offsetHeight;

var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = graphWidth - margin.left - margin.right,
        height = graphHeight - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // The scale spacing the groups:
    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    // The scale for spacing each group's bar:
    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    d3.csv("../assets/110_cases.csv", function(d, i, columns) {
        for (let i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
        return d;
    }).then(function(data) {
        console.log(data);

        let keys = data.columns.slice(1);

        x0.domain(data.map(function(d) { return d.scenario; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

        g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("class","bar")
            .attr("transform", function(d) { return "translate(" + x0(d.scenario) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { console.log(d); return keys.map(function(key) { return {key: key, value: d[key]}; }); })
            .enter().append("rect")
            .attr("class", "rect")
            .attr("x", function(d) { return x1(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("height", function(d) { return height - y(d.value); })
            .attr("fill", function(d) { return z(d.key); });

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));

        g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Percent infectious");

        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 17)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", z)
            .attr("stroke", z)
            .attr("stroke-width",2)
            .on("click",function(d) { update(d) });

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });




      }); //end of d3 data func


      document.querySelectorAll(".button").forEach(el => el.addEventListener('click', () => covidRateChange(el.dataset.sheet)) );

      var covidRateChange = function(chosenRate) {
        console.log(chosenRate);

        d3.csv(`../assets/${chosenRate}`, function(h, i, columns) {
            for (let i = 1, n = columns.length; i < n; ++i) h[columns[i]] = +h[columns[i]];
            console.log(h);
            return h;
        }).then(function(currentData) {

            console.log(currentData);
            let keys = currentData.columns.slice(1);

            // x0.domain(currentData.map(function(d) { return d.scenario; }));
            // x1.domain(keys).rangeRound([0, x0.bandwidth()]);
            // y.domain([0, d3.max(currentData, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

            svg.selectAll("g.bar")
                .data(currentData)
                .selectAll("rect")
                .data(function(h) { console.log(h); return keys.map(function(key) { return {key: key, value: h[key]}; }); })
                .transition()
                .attr("y", function(h) { return y(h.value); })
                .attr("height", function(h) { return height - y(h.value); })
                .attr("fill", "green")
                .duration(500);


        }); //end of d3 data func


      }; //end of covidRateChange
