
// automatically stop recording after this number of frames
// set to 0 to keep recording until ESC is pressed
const HARD_FRAME_LIMIT = 1000;

import DATA from "./data";

import requestAnimationFrame from "raf";
import ready from "domready";

import SimplexNoise from "./noise";

const simplex = new SimplexNoise(Math.random);

let canvas, ctx , width, height, halfWidth, halfHeight, xPos = 0, yPos = 0, angleOffset = 0, angleOffset2 = 0;

const NOISE_SCALE = 0.8;

let noiseStrength;

const tmp = {
    x: 0, y : 0
};

let running = true;

const capturer = typeof CCapture !== "undefined" && new CCapture( { format: 'png',
     framerate: 60
});

function noisy(x,y)
{
    x -= halfWidth;
    y -= halfHeight;

    const angle = Math.atan2(y ,x) + angleOffset;

    const d = Math.sqrt( x * x + y * y) * 0.005;
    
    const nx = Math.cos(angle) * d;
    const ny = Math.sin(angle) * d;

    tmp.x = halfWidth  + x + simplex.noise2D( (nx + xPos) * NOISE_SCALE, (ny + yPos) * NOISE_SCALE) * noiseStrength;
    tmp.y = halfHeight + y + simplex.noise2D( (ny + yPos) * NOISE_SCALE, (nx + xPos) * NOISE_SCALE) * noiseStrength;
    return tmp;
}

const {aabb,groups} = DATA;

let hue = 0;
let step = -360 / (groups.length + 1);

const bg = "#3B3A3A";

for (let i = 0; i < groups.length; i++)
{
    hue += step;
    groups[i].color = i === groups.length - 1 ? "#0220B1" : (i & 1) === 0 ? "#222" : "#e8e8e8";
}

let logged = false;
let count = 0;

window.marked = 0;
let printed = -1;

function mainLoop()
{
    if (count === 0)
    {
        xPos += 0.0011;
        yPos += 0.0007;

        angleOffset += 0.005;
        angleOffset2 += 0.003;

        noiseStrength = (0.7 + Math.sin(angleOffset2) * 0.3) * width * 0.02;
    }

    const {aabb,groups} = DATA;

    const scaleFactor = Math.min(
        width  / (aabb.maxX - aabb.minX),
        height  / (aabb.maxY - aabb.minY)
    );

    ctx.fillStyle = bg;
    ctx.fillRect(0,0,width,height);

    const hw = halfWidth * 1.2 - (aabb.maxX - aabb.minX) * scaleFactor / 2;
    const hh = halfHeight - (aabb.maxY - aabb.minY) * scaleFactor / 2;

    let pathCount = 0;

    for (let i = 0; i < groups.length; i++)
    {
        const { color, paths} = groups[i];

        ctx.fillStyle = color;

        for (let j = 0; j < paths.length; j++)
        {
            const array = paths[j];
            ctx.beginPath();
            const { x : x0, y : y0} =  noisy( hw + (array[0] - aabb.minX) * scaleFactor, hh + (array[1] - aabb.minY) * scaleFactor);

            ctx.moveTo( x0, y0 );

            if (pathCount === window.marked)
            {
                ctx.strokeStyle = "#f00";
                if (printed !== window.marked)
                {
                    console.log("#" + window.marked, array);
                    printed = window.marked;
                }
            } else
            {
                ctx.strokeStyle = "#000";
            }

            for (let k = 2; k < array.length; k += 2)
            {
                const { x, y } = noisy(hw + (array[k    ] - aabb.minX) * scaleFactor, hh + (array[k + 1] - aabb.minY) * scaleFactor);
                ctx.lineTo( x, y );
            }

            ctx.stroke();
            pathCount++;
        }
    }


    count++;
    if (capturer)
    {
        if (HARD_FRAME_LIMIT && count > HARD_FRAME_LIMIT)
        {
            capturer.capture(canvas);

            running = false;
            capturer.stop();
            capturer.save();
        }
    }

    if (running)
    {
        requestAnimationFrame(mainLoop);
    }
}

ready(function ()
{
    canvas = document.getElementById("screen");

    width  = (window.innerWidth & ~7);
    height = (window.innerHeight & ~3);

    halfWidth = width / 2;
    halfHeight = height / 2;

    canvas.width = width;
    canvas.height = height;

    ctx = canvas.getContext("2d");

    if (capturer)
    {
        capturer.start();

        window.addEventListener("keydown", function (ev) {
            if (ev.keyCode === 27)
            {
                running = false;
                capturer.stop();
                capturer.save();
            }
        }, true);
    }

    requestAnimationFrame(mainLoop);
});
