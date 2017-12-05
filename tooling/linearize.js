function adaptiveLinearization(x1, y1, x2, y2, x3, y3, x4, y4, threshold, lineConsumer)
{
    if(Math.abs(x1 + x3 - x2 - x2) +
        Math.abs(y1 + y3 - y2 - y2) +
        Math.abs(x2 + x4 - x3 - x3) +
        Math.abs(y2 + y4 - y3 - y3) <= threshold)
    {

        const x = x4 - x1;
        const y = y4 - y1;

        if (Math.sqrt(x*x+y*y) <= 2)
        {
            // Draw and stop
            //----------------------
            lineConsumer(x1, y1, x4, y4);
            return;
        }
    }

    // Calculate all the mid-points of the line segments
    //----------------------
    var x12   = (x1 + x2) / 2;
    var y12   = (y1 + y2) / 2;
    var x23   = (x2 + x3) / 2;
    var y23   = (y2 + y3) / 2;
    var x34   = (x3 + x4) / 2;
    var y34   = (y3 + y4) / 2;
    var x123  = (x12 + x23) / 2;
    var y123  = (y12 + y23) / 2;
    var x234  = (x23 + x34) / 2;
    var y234  = (y23 + y34) / 2;
    var x1234 = (x123 + x234) / 2;
    var y1234 = (y123 + y234) / 2;

    // Continue subdivision
    //----------------------
    adaptiveLinearization(x1, y1, x12, y12, x123, y123, x1234, y1234, threshold, lineConsumer);
    adaptiveLinearization(x1234, y1234, x234, y234, x34, y34, x4, y4, threshold, lineConsumer);
}

module.exports = adaptiveLinearization;
