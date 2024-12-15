import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";





const width = 500; 
const height = 500;
const margin = 40;

let parab1 = [-.04,-1.6,0];
let parab2 = [-0.5,40,-740];
let parabLower = [0.00002,0,-60];

let slope = 2.5;
let yint = -50;

// Target coordinates
const hidX = -20;
const hidY = -10; 

// X boundaries for the line 
const minX = -50;
const maxX = 50;

const parabPts = [];
const parabPts2 = [];
const myRayPts = [];
const reflectedPts = [];
const reflectedPts2 = [];


const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const xScale = d3.scaleLinear()
    .domain([-maxX, maxX]) // x-values for the parabola
    .range([margin, width-margin]);

const yScale = d3.scaleLinear()
    .domain([-maxX, maxX]) // y-values for the parabola
    .range([height-margin, margin]); // Invert the range for SVG



function parab(parab,minX,maxX,points){ 
    let [a,b,c] = parab;
    points.length=0;
    for (let x = minX; x <= maxX; x++) {
        const y = a*x*x + b*x + c;
        points.push({ x, y });
    }
}

function myRay(parab) {
    myRayPts.length = 0; // Clear previous points

    let [a,b,c] = parab;
    let x1,x2,y1,y2;


    // 1. Find intersection points
    const B = b - slope;
    const C = c - yint;
    const dis = B*B-4*a*C;
    if (dis >= 0){
        x1 = (-B + Math.sqrt(dis))/(2*a);
        x2 = (-B - Math.sqrt(dis))/(2*a);
        y1 = a*x1*x1 + b*x1 + c;
        y2 = a*x2*x2 + b*x2 + c;
    } else {
        console.log("1 discriminant is negative!");
    }

    for (let x = minX; x <= x2; x += 0.5) { // Increment step size for smoother visualization
        const y = slope * x + yint;
        myRayPts.push({ x, y });
    }
}
/* reflectedRayStartEnd: 
    input: original line's slope, yint and parabola's a,b,c it's bouncing off of. Also input the second parabola (end goal). 
        1. find starting X. (rayStartX)
        2. use 1) to find starting Y. 
        3. compute intersection for ending X and ending Y. 
    output: the reflected ray's starting and ending xy coordinates. 
*/

/* reflectedRay: 
    input: start and end of ray (x1,y1, x2,y2)
    output: draws the ray from start to end. 

*/
function reflectedRayStartEnd(xPrevious, parab_1, parab_2, slope1, yint1){
    let [a,b,c] = parab_1;
    let [a2,b2,c2] = parab_2;

    // Starting and end points of the ray I want to draw. 
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    let x1,x2,y1,y2;

    // 1. Find intersection points between original line and parabola
    const B = b - slope1;
    const C = c - yint1;
    const dis = B*B-4*a*C;
    if (dis >= 0){
        x1 = (-B + Math.sqrt(dis))/(2*a);
        x2 = (-B - Math.sqrt(dis))/(2*a);
        y1 = a*x1*x1 + b*x1 + c;
        y2 = a*x2*x2 + b*x2 + c;
    } else {
        console.log("2 discriminant is negative!");
    }

    if (Math. abs(xPrevious - x1) > Math.abs(xPrevious - x2)){
        startX = x2;
        startY = y2;
    } else {
        startX = x1;
        startY = y1;
    }

    const tS = -1/(2 * a * startX + b);
    let slope2 = (slope1 * tS * tS + 2 * tS - slope1)/(2* slope1 *tS - tS*tS + 1);
    //let yint2 = y2 - slope2 * startY;
    let yint2 = -startX * slope2 + startY;

    // 2. Find intersection points between new line and next parabola
    const B2 = b2 - slope2;
    const C2 = c2 - yint2;


    const dis2 = B2*B2-4*a2*C2;
    if (dis2 >= 0){
        x1 = (-B2 + Math.sqrt(dis2))/(2*a2);
        x2 = (-B2 - Math.sqrt(dis2))/(2*a2);
        y1 = a2*x1*x1 + b2*x1 + c2;
        y2 = a2*x2*x2 + b2*x2 + c2;
    } else {
        console.log("3 discriminant is negative!");
    }

    if (Math. abs(startX - x1) > Math.abs(startX - x2)){
        endX = x2;
        endY = y2;
    } else {
        endX = x1;
        endY = y1;
    }

    return [startX, startY, endX, endY, slope2, yint2];
}


function reflectedRay(xPrevious, parab_1, parab_2, slope1, yint1, points){
    points.length = 0;

    // 1. Create reflected ray
    let [sX, sY, eX, eY, slope2, yint2] = reflectedRayStartEnd(xPrevious, parab_1, parab_2, slope1, yint1);

    if (eX > sX){
        for (let x = sX; x < eX; x+=0.01){
            const y = (eY-sY)*(x-sX)/(eX-sX) + sY;
            points.push({x,y});
        }
    } else {
        for (let x = eX; x < sX; x+=0.01){
            const y = (sY-eY)*(x-eX)/(sX-eX) + eY;
            points.push({x,y});
        }
    }
    

    return [sX, slope2, yint2];
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



// Draw points here 
function updateGraph() {
    svg.selectAll("*").remove();

    myRay(parab1, slope, yint);

    parab(parab1, minX, maxX, parabPts);
    parab(parab2, minX, maxX, parabPts2);

    let [sX2, slope2, yint2] = reflectedRay(minX, parab1, parab2, slope, yint, reflectedPts);
    let [sX3, slope3, yint3] = reflectedRay(sX2, parab2, parabLower, slope2, yint2, reflectedPts2);

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
    
    // Draw the parabola
    svg.append("path")
        .datum(parabPts2)
        .attr("class", "parabola")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);

    // Draw my ray
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

    // Draw the second reflected ray
    svg.append("path")
        .datum(reflectedPts2)
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
        .attr("fill", "#39FF14");
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


document.getElementById("submitButton").addEventListener("click", function () {
    const tolerance = 1;
    let matchFound = false;

    for (let i=0; i<reflectedPts2.length; i++){
        const diffX = Math.abs(reflectedPts2[i].x - hidX);
        const diffY = Math.abs(reflectedPts2[i].y - hidY);
        if( diffY < tolerance && diffX < tolerance){
            console.log("you got it right!");
            matchFound = true;
            // Flash effect for correct match
            let flashCount = 0;
            const flashInterval = setInterval(function () {
                document.body.style.backgroundColor = (flashCount % 2 === 0) ? "green" : "black"; // Alternate colors
                flashCount++;
                if (flashCount >= 6) { // Stop flashing after 3 flashes (6 half-flashes)
                    clearInterval(flashInterval);
                    document.body.style.backgroundColor = "black"; // Ensure it stays green at the end
                }
            }, 200); // Flash every 200 milliseconds
            document.getElementById("nextLevelButton").style.display = "block";
            break;
        } 
    }
    if (!matchFound){
        console.log("try again!");
        let flashCount = 0;
        const flashInterval = setInterval(function () {
            document.body.style.backgroundColor = (flashCount % 2 === 0) ? "red" : "black"; // Alternate colors
            flashCount++;
            if (flashCount >= 6) { // Stop flashing after 3 flashes (6 half-flashes)
                clearInterval(flashInterval);
                document.body.style.backgroundColor = "black"; // Ensure it stays green at the end
            }
        }, 200); // Flash every 200 milliseconds
    }
});

// document.getElementById("nextLevelButton").addEventListener("click", function () {
//     window.location.href = "level2.html"; // Redirect to level2.html
// });




