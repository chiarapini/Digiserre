function Graph(value, array, x, y,maxValue, limit, name,r,g,b) {
  this.value = value;
  this.array = array;
  this.y = y;
  this.x = x;
  this.maxValue = maxValue;
  this.w = windowWidth - 100;
  this.display = function() {
    fill(0);
    noStroke();
    //graph title 
    textSize(18);
    textAlign(LEFT);
    text(name, x + margin, y + margin);
    push();
    translate(0, margin + padding);
    //graph text y axis
    textSize(12);
    textAlign(RIGHT, BOTTOM);
    text("0", x + margin - padding, y + h); 
    textAlign(RIGHT, TOP);
    text(maxValue, x + margin - padding, y);
    push()
    translate(margin, 0);
    fill(r,g,b,50);
    rect(x, y, x + w, limit); //coloured treshold
    stroke(0);
    line(x, y, x, y + h); //y axis
    line(x, y + h, x + w, y + h); //x axis
    noStroke();
    // Data time
    for (i = 1; i < times.length; i++) {
    fill(0);
    // 13:09 instead of 13:9 - add a zero when minutes are < 10
    if (times[i].getMinutes()<10){
    minutes="0";
    } else {minutes="";}  
    //timeStamp
    text(times[i].getHours() + ":" + minutes+times[i].getMinutes(), i * step, y + h + 2 * padding);
    }
    pop();
    pop();
  }
  this.displayData = function() {
    this.display();
    if (this.array.length >= int(w / step)) {
        this.array.splice(0, 1);
      }
    this.array.push(this.value);
    push();
      translate(margin, margin + padding+y);
      for (var i = 1; i < this.array.length; i++) {
        val = map(this.array[i], 0, maxValue, 200, 0);
        valPrec = map(this.array[i - 1], 0, maxValue, 200, 0);
        stroke(r, g, b);
        line((i - 1) * step, valPrec, i * step, val);
        noStroke();
        fill(r, g, b);
        ellipse(i * step, val, 5, 5);
  }
  pop();
   }
}
