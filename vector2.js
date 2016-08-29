var Vector2 = function()
{
    this.x = 0;
    this.y = 0;
}
Vector2.prototype.copy = function() {
    var newVector = new Vector2();
    newVector.x = this.x;
    newVector.y = this.y;
    return newVector;
}

//Set the Components of the Vectors
Vector2.prototype.set = function(x, y)
{
    this.x = x;
    this.y = y;
}
Vector2.prototype.normalize = function() 
{

}

Vector2.prototype.Add = function(v2)
{
   this.x += v2.x;
   this.y += v2.y;
}

Vector2.prototype.Subtract = function(v2)
{
   this.x -= v2.x;
   this.y -= v2.y;
}

Vector2.prototype.multiplyScalar = function(v2)
{
    var newVector = new Vector2();
    newVector.set(this.x * otherVector, this.y * otherVector);
    return newVector;
}