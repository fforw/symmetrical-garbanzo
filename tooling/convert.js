const fs = require("fs");
const path = require("path");
const SVGPath = require("svgpath");

const jsdom = require("jsdom").JSDOM;

const AABB = require("./aabb");

const AdaptiveLinearization = require("adaptive-linearization");

const Math__abs = Math.abs;

const OPTS = {
    approximationScale: 0.5,
    angleTolerance: 0.4
};

const MAX_LINE = 8;


const aabb = new AABB();

function linearizePath(desc)
{
    const path = SVGPath(desc).unarc().unshort().abs();

    const points = [];

    let prevIndex = Infinity;

    let drawLine = (x1, y1, x2, y2, index) =>
    {
        //console.log("drawLine", JSON.stringify({x1, y1, x2, y2, index}));

        const dx = x2 - x1;
        const dy = y2 - y1;

        if (Math__abs(dx) > MAX_LINE || Math__abs(dy) > MAX_LINE || Math.sqrt(dx*dx+dy*dy) > MAX_LINE)
        {
            const xMid = (x1 + x2)/2;
            const yMid = (y1 + y2)/2;

            drawLine(x1,y1,xMid,yMid, index);
            drawLine(xMid,yMid,x2,y2, index);
            return;
        }
        
        if (index < prevIndex)
        {
            points.push(x1, y1);
            aabb.extend(x1, y1);
        }
        prevIndex = index;

        points.push(x2,y2);
        //console.log("CONSUME", x1, y1, x2, y2);
        aabb.extend(x2, y2);
    };
    
    const al = new AdaptiveLinearization(drawLine, OPTS);

    path.iterate(al.svgPathIterator, false);

    return points;
}


window = new jsdom(fs.readFileSync( path.join(__dirname, "../shapes.svg"), "UTF-8")).window;

const document = window.document;

let sum = 0;

const groups = Array.prototype.map.call(document.querySelectorAll("g:not([id='layer1'])"), (groupElem, index) => {

    return {
        color: (index & 1) === 0 ? "#000" : "#d0d",
        paths: Array.prototype.map.call(groupElem.querySelectorAll("path"), pathElem => {
            let points = linearizePath(pathElem.getAttribute("d"));

            sum += points.length / 2;
            
            return points;
        })
    };

});

console.log("Number of coordinate points:", sum);

fs.writeFileSync("./src/data.js", "export default " + JSON.stringify({
    groups,
    aabb
}) + ";", "UTF-8");




