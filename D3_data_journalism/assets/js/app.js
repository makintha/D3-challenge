function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
  
    // clear svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  
    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;
  
    var margin = {
      top: 30,
      bottom: 80,
      right: 30,
      left: 80
    };
  
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgHeight - margin.left - margin.right;

    // Append SVG element
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

    // Append group element
    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial chosen parameters
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function for xScale
    function xScale(povertyData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(povertyData, d => d[chosenXAxis]) * 0.8,
            d3.max(povertyData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // function for yscale
    function yScale(povertyData, chosenYAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(povertyData, d => d[chosenYAxis]) * 0.8,
            d3.max(povertyData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    // render selected xAxis upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // render selected yAxis upon click on axis label
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }
    
    // function used for updating circles group with a transition to
    // new circles when clicking on new axis
    function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    // function used for updating the text in the circles group with a transition to
    // new circles when clicking on new axis
    function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
        textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis])+6);
        return textGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, textGroup) {

        if (chosenXAxis === "poverty") {
            var xlabel = "In Poverty:";
        }
        else if (chosenXAxis === "age") {
            var xlabel = "Median Age:";
        }
        else {
            var xlabel = "Median Income:";
        }

        if (chosenYAxis === "healthcare") {
            var ylabel = "Lack Healthcare:";
        }
        else if (chosenYAxis === "smokes") {
            var ylabel = "Smoke";
        }
        else {
            var ylabel = "Obese";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}%`);
            });

        textGroup.call(toolTip);

        textGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
            // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });

        return textGroup;

    }

   // Import Data
   var file = "assets/data/data.csv"
   d3.csv(file).then(successHandle, errorHandle);

   function errorHandle(error){
       throw err;
   }

   function successHandle(povertyData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    povertyData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = xScale(povertyData, chosenXAxis);
    var yLinearScale = yScale(povertyData, chosenYAxis);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
        .data(povertyData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("fill", "skyblue")
        .attr("opacity", ".75");
    
    var textGroup = chartGroup.selectAll(".label")
        .data(demoData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(function(d) {return d.abbr;})
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis])+6)
        .attr("fill", "white")
        .attr("font-family","sans-serif");


    }
    // // Read CSV
    // d3.csv("assets/data/data.csv").then(function(povertyData) {
    //     console.log(povertyData)

    //     // parse data
    //     povertyData.forEach(function(data) {
    //         data.poverty = +data.poverty;
    //         data.healthcare = +data.healthcare;
    //     });

    //     // create scales
    //     var xScale = d3.scaleLinear()
    //         .domain([d3.min(povertyData, d => d.poverty)*.8, d3.max(povertyData, d => d.poverty)*1.2])
    //         .range([0, width]);

    //     var yScale = d3.scaleLinear()
    //         .domain([d3.min(povertyData, d => d.healthcare)*0.8, d3.max(povertyData, d => d.healthcare)*1.2])
    //         .range([height, 0]);

    //     // create axes
    //     var yAxis = d3.axisLeft(yScale);
    //     var xAxis = d3.axisBottom(xScale);

    //     // set x to the bottom of the chart
    //     chartGroup.append("g")
    //     .attr("transform", `translate(0, ${height})`)
    //     .call(xAxis);

    //     chartGroup.append("g")
    //     .call(yAxis);

    //     // xtitle
    //     chartGroup.append("text")
    //     .attr("transform", `translate(${width/2}, ${height  + margin.top - 10})`)
    //     .attr("text-anchor", "middle")
    //     .attr("font-size", "16px")
    //     .text("Poverty (%)");

    //     // ytitle
    //     chartGroup.append("text")
    //     // .attr("transform", `translate(0, ${height/2})`)
    //     .attr("text-anchor", "middle")
    //     .attr("font-size", "16px")
    //     .text("Lacks of Healthcare (%)")
    //     .classed('rotation', true)
    //     .attr('fill', 'black')
    //     // .attr("transform", "rotate(-90)");
    //     .attr('transform', (d,i)=>{
    //         return `translate(-30, ${height/2}),rotate(-90)`});

    //     // Creating Scatter plot
    //     svg.append('g')
    //     .selectAll("circle")
    //     .data(povertyData)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", d => xScale(d.poverty) )
    //     .attr("cy", d => yScale(d.healthcare) )
    //     .attr("r", 10)
    //     .style("fill", "#69b3a2")  
    //     .append("text")
    //     .text(d => d.abbr)
    //     .style("fill", "#fff")
    //     .attr("x",  d => xScale(d.poverty))  
    //     .attr("y", d => yScale(d.healthcare))
    // });
};

makeResponsive()