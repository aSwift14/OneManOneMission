var Vector2 = function()
{
    this.x = 0;
    this.y = 0;
}

//Set the Components of the Vectors
Vector2.prototype.set = function(x, y)
{
    this.x = x;
    this.y = y;
}

Vector2.prototype.Add = function(otherVector)
{
    var newVector = new Vector2();
    newVector.set(this.x + otherVector, this.y + otherVector);
    return newVector;
}

Vector2.prototype.Subtract = function(otherVector)
{
    var newVector = new Vector2();
    newVector.set(this.x - otherVector, this.y - otherVector);
    return newVector;
}

Vector2.prototype.Multiply = function(otherVector)
{
    var newVector = new Vector2();
    newVector.set(this.x * otherVector, this.y * otherVector);
    return newVector;
}