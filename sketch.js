var vertices = [];
var edges = [];
var edgesToDraw = [];
var parent = [];
var height = [];
var edgeFrames = 0;
var currEdge = 0; // To hopefully make it run faster;
var currEdgeDraw = 0;
var frames = 30;
var diam = 20;
var paused = false;
var slowingDown = false;
var numVertices = 1;
function setup() {
  createCanvas(windowWidth, windowHeight);
  numVertices = prompt("Type the number of points you'd like to simulate");
  while(numVertices <= 0) {
    numVertices = prompt("Number of points must be positive, try again");
  }
  frames = prompt("Type the number of frames you'd like each edge to draw for (simulation attempts to draw at 60 frames per second)");
  while(frames <= 0 || (frames - Math.round(frames) !== 0)) {
    frames = prompt("Invalid number of frames, try again");
  }
  runKruskals();
}

function draw() {
  background(150);
  // Reverse 'r'
  if(keyIsDown(82)){
    edgeFrames--;
    if(edgeFrames < 0){
      edgeFrames = frames-1;
      currEdgeDraw--;
      if(currEdgeDraw < 0){
        currEdgeDraw = 0;
        edgeFrames = 0;
      }
    }
    if(!paused){
      edgeFrames--;
      if(edgeFrames < 0){
        edgeFrames = frames-1;
        currEdgeDraw--;
        if(currEdgeDraw < 0){
          currEdgeDraw = 0;
          edgeFrames = 0;
        }
      }
    }
  }
  // Fast-forward 'f'
  if(keyIsDown(70)){
    if(currEdgeDraw < edgesToDraw.length){
      edgeFrames++;
      if(edgeFrames == frames){
        edgeFrames = 0;
        currEdgeDraw++;
      }
    }
  }
  // Slow down 's'
  if(keyIsDown(83)){
    if(!slowingDown){
      slowingDown = true;
      edgeFrames *= 2;
      frames *= 2;
    }
  }else{
    if(slowingDown){
      slowingDown = false;
      edgeFrames = Math.floor(edgeFrames/2);
      frames /= 2;
    }
  }
  drawEdges();
  drawPoints();
}

function drawEdges(){
  strokeWeight(diam/7);
  stroke("black");
  for(let i = 0; i < currEdgeDraw; i++){
    let v1 = vertices[edgesToDraw[i][0]];
    let v2 = vertices[edgesToDraw[i][1]];
    line(v1.x,v1.y,v2.x,v2.y);
  }
  if(currEdgeDraw < edgesToDraw.length){
    if(!paused){
      edgeFrames++;
    }
    stroke("green");
    let alpha = edgeFrames/frames;
    let v1 = vertices[edgesToDraw[currEdgeDraw][0]];
    let v2 = vertices[edgesToDraw[currEdgeDraw][1]];
    line(v1.x,v1.y,v1.x*(1-alpha) + v2.x*(alpha),v1.y*(1-alpha) + v2.y*(alpha));
    if(edgeFrames == frames){
      edgeFrames = 0;
      currEdgeDraw++;
    }
  }
}

function drawPoints(){
  const v1 = currEdgeDraw < edgesToDraw.length ? edgesToDraw[currEdgeDraw][0] : -1;
  const v2 = currEdgeDraw < edgesToDraw.length ? edgesToDraw[currEdgeDraw][1] : -1;
  stroke("black");
  strokeWeight(0);
  textSize(20);
  for(let i = 0; i < vertices.length; i++){
    if(i != v1 && i != v2){
      fill("blue");
      ellipse(vertices[i].x,vertices[i].y,diam,diam);
      // fill("black");
      // text(i.toString(), vertices[i].x-diam/2, vertices[i].y+diam/2);
    }
  }
  if(v1 != -1 && v2 != -1){
    fill("red");
    ellipse(vertices[v1].x,vertices[v1].y,diam,diam);
    fill("red");
    ellipse(vertices[v2].x,vertices[v2].y,diam,diam);
    // fill("black");
    // text(v1.toString(), vertices[v1].x-diam/2, vertices[v1].y+diam/2);
    // fill("black");
    // text(v2.toString(), vertices[v2].x-diam/2, vertices[v2].y+diam/2);
  }
}

function union(a,b){
  let u = find(a);
  let v = find(b);
  if(u == v)
    return;
  if(height[u]<height[v]){ 
    parent[v]=u; 
  }else if(height[u]<height[v]) { 
    parent[u]=v; 
  }else{ 
    parent[v]=u; 
    height[v]++; 
  } 
}

function find(a){
  if(parent[a] == a)
    return a;
  return parent[a] = find(parent[a]);
}

function compareEdges(e1, e2){
  return e1[2] - e2[2];
}

function keyPressed(){
  if(key === ' '){
    paused = !paused;
  }else if(key === 'n'){
    runKruskals();
  }else if(key === 'q'){
    edgeFrames = 0;
    currEdgeDraw = 0;
  }else if(key === 'e'){
    currEdgeDraw = edgesToDraw.length;
    edgeFrames = 0;
  }
  // }else if(key === 's'){
  //   saveGif("kruskals",1);
  // }
}

function runKruskals(){
  vertices = [];
  edges = [];
  height = [];
  parent = [];
  edgesToDraw = [];
  edgeFrames = 0;
  currEdge = 0;
  currEdgeDraw = 0;
  paused = false;
  slowingDown = false;
  diam = windowWidth/(15*Math.log(numVertices+1));
  for(let i = 0; i < numVertices; i++){
    let x = Math.floor(diam/2 + Math.random()*(windowWidth-diam));
    let y = Math.floor(diam/2 + Math.random()*(windowHeight-diam));
    vertices.push(createVector(x,y));
    parent.push(i);
    height.push(1);
  }
  for(let i = 0; i < numVertices; i++){
    for(let j = i + 1; j < numVertices; j++){
      let v1 = vertices[i];
      let v2 = vertices[j];
      edges.push([i,j,dist(v1.x,v1.y,v2.x,v2.y)]);
    }
  }
  edges.sort(compareEdges);

  // Run Kruskal's Algorithm
  while(edgesToDraw.length < numVertices-1){
    let edge = edges[currEdge];
    currEdge++;
    let v1 = edge[0];
    let v2 = edge[1];
    while(find(v1) == find(v2)){
      edge = edges[currEdge];
      currEdge++;
      v1 = edge[0];
      v2 = edge[1];
    }
    union(v1,v2);
    edgesToDraw.push([v1,v2]);
  }
}