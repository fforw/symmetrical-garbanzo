function AABB()
{
    this.minX = Infinity;
    this.minY = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
}

AABB.prototype.extend = function (x, y)
{
    if (x < this.minX)
    {
        this.minX = x;
    }

    if (y < this.minY)
    {
        this.minY = y;
    }

    if (x > this.maxX)
    {
        this.maxX = x;
    }

    if (y > this.maxY)
    {
        this.maxY = y;
    }
};


module.exports = AABB;
