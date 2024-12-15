import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = 500; 
const height = 500;
const margin = 40;

let a = .5;
let b = 9;
let c = -2;

let slope = -1;
let yint = 0;
let slope2 = 0;


// Target coordinates
const hidX = -50;
const hidY = -50; 

const minX = -150;
const maxX = 200;

const parabPts = [];
const myRayPts = [];
const reflectedPts = [];


const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const xScale = d3.scaleLinear()
    .domain([-200, maxX]) // x-values for the parabola
    .range([margin, width-margin]);

const yScale = d3.scaleLinear()
    .domain([-200, maxX]) // y-values for the parabola
    .range([height-margin, margin]); // Invert the range for SVG



function parab(a,b,c,minX,maxX){ 
    parabPts.length=0;
    for (let x = minX; x <= maxX; x++) {
        const y = a*x*x + b*x + c;
        parabPts.push({ x, y });
    }
}

function myRay(a, b, c, slope, yint) {
    myRayPts.length = 0; // Clear previous points

    let x1,x2,y1,y2;


    // 1. Find intersection points
    const B = b - slope;
    const C = c - yint;
    const dis = B*B-4*a*C;
    if (dis >= 0){
        x1 = (-B + Math.sqrt(dis))/(2*a);
        x2 = (-B - Math.sqrt(dis))/(2*a);
        y1 = a*x2*x2 + b*x2 + c;
        y2 = a*x2*x2 + b*x2 + c;
    } else {
        console.log("discriminant is negative!");
    }

    console.log("Minimum", minX);
    console.log("x1", x2);

    for (let x = minX; x <= x2; x += 0.5) { // Increment step size for smoother visualization
        const y = slope * x + yint;
        myRayPts.push({ x, y });
    }
}


function reflectedRay(a, b, c, slope, yint){
    reflectedPts.length = 0;
    
    let x1,x2,y1,y2;


    // 1. Find intersection points
    const B = b - slope;
    const C = c - yint;
    const dis = B*B-4*a*C;
    if (dis >= 0){
        x1 = (-B + Math.sqrt(dis))/(2*a);
        x2 = (-B - Math.sqrt(dis))/(2*a);
        y1 = a*x2*x2 + b*x2 + c;
        y2 = a*x2*x2 + b*x2 + c;
    } else {
        console.log("discriminant is negative!");
    }

    // 2. Create reflected ray
    if (slope <= 0){
        const tS = -1/(2 * a * x2 + b);
        for (let x = minX; x <= x2; x+=0.01){
            const y = (slope * tS * tS + 2 * tS - slope)*(x-x2)/(2* slope *tS - tS*tS + 1) + y2;
            reflectedPts.push({x,y});
        }
    } else {
        const tS = -1/(2 * a * x1 + b);
        for (let x = minX; x <= x1; x+=0.01){
            const y = (slope * tS * tS + 2 * tS - slope)*(x-x1)/(2* slope *tS - tS*tS + 1) + y1;
            reflectedPts.push({x,y});
        }
    } 
}

function addGridlines(svg, xScale, yScale, width, height) {
    // Horizontal gridlines
    const yAxis = d3.axisLeft(yScale)
        .tickSize(-width + margin) // Make gridlines span the width

    // Vertical gridlines
    const xAxis = d3.axisBottom(xScale)
        .tickSize(-height + margin) // Make gridlines span the height

    // Append horizontal gridlines
    svg.append("g")
        .attr("class", "grid grid-y")
        .attr("transform", `translate(${margin}, 0)`)
        .call(yAxis)
        .selectAll(".tick line")
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 0.7);

    // Append vertical gridlines
    svg.append("g")
        .attr("class", "grid grid-x")
        .attr("transform", `translate(0, ${height - margin})`)
        .call(xAxis)
        .selectAll(".tick line")
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 0.7);
}

// Add gridlines to your graph
addGridlines(svg, xScale, yScale, width, height);

function updateGraph() {
    svg.selectAll("*").remove();

    parab(a, b, c, minX, maxX);
    myRay(a, b, c, slope, yint);
    reflectedRay(a, b, c, slope, yint);

    addGridlines(svg, xScale, yScale, width, height);

    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveLinear);

    // Draw the parabola
    svg.append("path")
        .datum(parabPts)
        .attr("class", "parabola")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);

    // Draw the ray
    svg.append("path")
        .datum(myRayPts)
        .attr("class", "ray")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2);

    // Draw the reflected ray
    svg.append("path")
        .datum(reflectedPts)
        .attr("class", "reflected-ray")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2);

    // Draw the hidden target point
    svg.append("circle")
        .datum({ x: hidX, y: hidY })
        .attr("class", "target-point")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 5)
        .attr("fill", "green");
}


updateGraph();

document.getElementById("slopeSlider").addEventListener("input", function() {
    slope = parseFloat(this.value);
    document.getElementById("slopeValue").textContent = slope;
    updateGraph();
});

document.getElementById("yintSlider").addEventListener("input", function() {
    yint = parseFloat(this.value);
    document.getElementById("yintValue").textContent = yint;
    updateGraph();
});


document.getElementById("aSlider").addEventListener("input", function() {
    a = parseFloat(this.value);
    document.getElementById("aValue").textContent = a;
    updateGraph();
});

document.getElementById("submitButton").addEventListener("click", function () {
    const tolerance = 10;
    let matchFound = false;

    for (let i=0; i<reflectedPts.length; i++){
        const diffX = Math.abs(reflectedPts[i].x - hidX);
        const diffY = Math.abs(reflectedPts[i].y - hidY);
        if( diffY < tolerance && diffX < tolerance){
            console.log("you got it right!");
            matchFound = true;
            break;
        } 
    }
    if (!matchFound){
        console.log("try again!");
    }
    
})





