// var paywall = require("./lib/paywall");
// setTimeout(() => paywall(12345678), 5000);

require("component-responsive-frame/child");
const d3 = require("d3");

var callback = function(){

var graphWidth = document.getElementById('graph').offsetWidth;
var graphHeight = document.getElementById('graph').offsetHeight;

var marginBottom = graphWidth > 500 ? 75 : 25;

var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: marginBottom, left: 40},
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

    d3.csv("assets/110_cases.csv", function(d, i, columns) {
        for (let i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
        return d;
    }).then(function(data) {

        let keys = data.columns.slice(1);

        x0.domain(data.map(function(d,i) {
          return (graphWidth > 500) ? d.scenario : i + 1;
        }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }) + 2; })]).nice();

        g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("class","bar")
            .attr("transform", function(d,i) { return (graphWidth > 500) ? "translate(" + x0(d.scenario) + ",0)" : "translate(" + x0(i+ 1) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
            .enter().append("rect")
            .attr("class", "rect")
            .attr("x", function(d) { return x1(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("height", function(d) { return height - y(d.value); })
            .attr("fill", function(d) { return z(d.key); });


      // Controls the text labels at the top of each bar. Partially repeated in the resize() function below for responsiveness.
    	svg.selectAll("g.bar")
        .data(data)
        .selectAll("text")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("text")
    	  .attr("class","label")
    	  .attr("x", (function(d) { return x1(d.key) + x1.bandwidth() / 2 ; }  ))
    	  .attr("y", function(d) { return y(d.value) - 15; })
    	  .attr("dy", ".75em")
        .attr("text-anchor", "middle")
    	  .text(function(d) { return d.value; });


        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .attr("font-size", 15)
            .call(d3.axisBottom(x0).tickSizeOuter(0));

        g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(null, "s").tickFormat(d => d + "%"))
            .attr("font-size", 14)
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-size", 14)
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Total percentage infected by Dec. 1");

        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 13)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + (i * 20 + 15) + ")"; });

        legend.append("rect")
            .attr("x", width - 17)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", z)
            .attr("stroke", z)
            .attr("stroke-width",2);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });


        var insertLinebreaks = function (d) {
          var el = d3.select(this);
          var words = d.split('|');
          el.text('');

          for (var i = 0; i < words.length; i++) {
              var tspan = el.append('tspan').text(words[i]).attr("font-size", 14);
              if (i > 0)
                  tspan.attr('x', 0).attr('dy', '15').attr("font-size", 14);
          }
      };

      if (graphWidth > 500) {
        svg.selectAll('g.x.axis g text').each(insertLinebreaks);
      } else {}






      }); //end of d3 data func


      document.querySelectorAll(".button").forEach(el => el.addEventListener('click', () => covidRateChange(el.dataset.sheet)) );

      var covidRateChange = function(chosenRate) {
        document.querySelectorAll(".button").forEach(el => el.classList.remove('selected'));
        document.querySelectorAll(`.button[data-sheet="${chosenRate}"]`).forEach(el => el.classList.add('selected'));

        d3.csv(`assets/${chosenRate}`, function(h, i, columns) {
            for (let i = 1, n = columns.length; i < n; ++i) h[columns[i]] = +h[columns[i]];
            return h;
        }).then(function(currentData) {
            let keys = currentData.columns.slice(1);

            svg.selectAll("g.bar")
                .data(currentData)
                .selectAll("rect")
                .data(function(h) { return keys.map(function(key) { return {key: key, value: h[key]}; }); })
                .transition()
                .attr("y", function(h) { return y(h.value); })
                .attr("height", function(h) { return height - y(h.value); })
                .duration(500);

            svg.selectAll("g.bar")
              .data(currentData)
              .selectAll("text")
              .data(function(h) { return keys.map(function(key) { return {key: key, value: h[key]}; }); })
              .transition()
          	  .attr("y", function(h) { return y(h.value) - 15; })
          	  .text(function(h) { return h.value; })
              .duration(500);


        }); //end of d3 data func


      }; //end of covidRateChange


}; // end of callback function

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  callback();
} else {
  document.addEventListener("DOMContentLoaded", callback);
}
