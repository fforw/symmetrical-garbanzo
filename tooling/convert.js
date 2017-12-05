const fs = require("fs");
const path = require("path");
const SVGPath = require("svgpath");

const jsdom = require("jsdom").JSDOM;

const AABB = require("./aabb");

const linearize = require("./linearize");

const LINEARIZATION_THRESHOLD = 0.15;

const aabb = new AABB();

function linearizePath(desc)
{
    const path = SVGPath(desc).unarc().unshort().abs();

    const points = [];

    const startLine = (x,y) =>
    {
        if (typeof x !== "number" || typeof y !== "number")
        {
            throw new Error("not a number" + x + ", " + y);
        }

        points.push(x,y);
        aabb.extend(x, y);
    };

    const drawLine = (x1,y1,x2,y2) =>
    {
        if (typeof x2 !== "number" || typeof y2 !== "number")
        {
            throw new Error("not a number" + x2 + ", " + y2);
        }
        points.push(x2,y2);
        //console.log("CONSUME", x1, y1, x2, y2);
        aabb.extend(x2, y2);
    };

    path.iterate(function (segment, index, curX, curY)
    {
        const command = segment[0];

        let i, x, y, x2, y2, x3, y3, x4, y4, short;

        console.log({segment});

        //noinspection FallThroughInSwitchStatementJS
        switch (command)
        {
            case "M":
                startLine(segment[1],segment[2]);
                for (i = 3; i < segment.length; i += 2)
                {
                    x = segment[i];
                    y = segment[i + 1];

                    drawLine(curX, curY, x, y);

                    curX = x;
                    curY = y;
                    aabb.extend(x,y);
                }
                    break;
            case "L":
                startLine(segment[1],segment[2]);
                for (i = 3; i < segment.length; i += 2)
                {
                    x = segment[i];
                    y = segment[i + 1];

                    drawLine(curX, curY, x, y);

                    curX = x;
                    curY = y;
                    aabb.extend(x,y);
                }
                break;
            case "H":

                x = segment[1];
                y = curY;

                drawLine(curX, curY, x, y);

                curX = x;

                aabb.extend(x,y);
                break;
            case "V":

                x = curX;
                y = segment[1];

                drawLine(curX, curY, x, y);

                curY = y;
                break;
            case "Z":
                break;
            case "Q":
                short = true;
            // intentional fallthrough
            case "C":
                //console.log("C segment", segment);
                let step = short ? 4 : 6;

                startLine(curX,curY);

                for (i = 1; i < segment.length; i += step)
                {
                    x = curX;
                    y = curY;
                    x2 = segment[i];
                    y2 = segment[i + 1];
                    x3 = short ? x2 : segment[i + 2];
                    y3 = short ? y2 : segment[i + 3];
                    x4 = short ? segment[i + 2] : segment[i + 4];
                    y4 = short ? segment[i + 3] : segment[i + 5];

                    linearize(
                        x,y,
                        x2,y2,
                        x3,y3,
                        x4,y4,
                        LINEARIZATION_THRESHOLD,
                        drawLine
                    );

                    curX = x;
                    curY = y;
                }
                break;
            default:
                throw new Error("path command '" + command + "' not supported yet");

        }
    }, false);

    return points;
}


window = new jsdom(fs.readFileSync( path.join(__dirname, "../shapes.svg"), "UTF-8")).window;

const document = window.document;

let sum = 0;

const groups = Array.prototype.map.call(document.querySelectorAll("g"), (groupElem, index) => {


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




