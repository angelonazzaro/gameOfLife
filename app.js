function drawSingleCell(x, y, state = "dead") {
	ctx.beginPath();
	ctx.moveTo(x, y);
	// This is going to be used to identify which cell the user has clicked on
	// and if it needs to be alive or dead.
	cellMap.set(x + '_' + y, { x: x, y: y, state: state });

	ctx.fillRect(x, y, cellDimension, cellDimension);
	ctx.strokeRect(x, y, cellDimension, cellDimension);

	ctx.closePath();
}

function setCellStyle(fillStyle, strokeStyle) {
	ctx.fillStyle = fillStyle;
	ctx.strokeStyle = strokeStyle;
}

function calculateDimensionDifference(dim, cdim) {
	const difference = dim / cdim; 
	// Returns the decimal part of the coefficient
	return difference - Math.floor(difference);
}

function checkIfNeighbourIsAlive(x, y) {
	let neighbour = null; 

	if ((neighbour = cellMap.get(x + "_" + y)))
		return neighbour.state === "alive";
	
	return false;
}

function countAliveNeighbours(x, y) {
	// One of the 8 cells that surround the cell in any direction
	// Each neighbour is located at +- 17px in any direction from
	// the current cell 
	let aliveNeighbours = 0;
	
	// Adding or subtracting from y, we move vertically
	// Adding or subtracting from x, we move horizontally
	// Combine these two and we move directionally
	if (checkIfNeighbourIsAlive(x, y + cellDimension))
		aliveNeighbours++;
	
	if (checkIfNeighbourIsAlive(x, y - cellDimension))
		aliveNeighbours++;
	
	if (checkIfNeighbourIsAlive(x + cellDimension, y))
		aliveNeighbours++;
	
	if (checkIfNeighbourIsAlive(x - cellDimension, y)) 
		aliveNeighbours++;
	
	if (checkIfNeighbourIsAlive(x + cellDimension, y + cellDimension)) 
		aliveNeighbours++;
	
	if (checkIfNeighbourIsAlive(x + cellDimension, y - cellDimension)) 
		aliveNeighbours++;
	
	if (checkIfNeighbourIsAlive(x - cellDimension, y + cellDimension)) 
		aliveNeighbours++;
	
	if (checkIfNeighbourIsAlive(x - cellDimension, y - cellDimension)) 
		aliveNeighbours++;
	
	return aliveNeighbours;
}

function evolve(x, y) {
	// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
	// Any live cell with two or three live neighbours lives on to the next generation.
	// Any live cell with more than three live neighbours dies, as if by overpopulation.
	// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction
	const aliveNeighbours = countAliveNeighbours(x, y);
	const cell = cellMap.get(x + "_" + y); 

	if (cell.state === "alive") {
		if (aliveNeighbours === 2 || aliveNeighbours === 3) return;

		cell.state = "dead";
		setCellStyle(deadFillStyle, deadStrokeStyle);
	} else {
		if (aliveNeighbours !== 3) return; 

		cell.state = "alive";
		setCellStyle(aliveFillStyle, aliveStrokeStyle);
	}

	drawSingleCell(x, y, cell.state);
}

// Get computed style for css variables
const computedStyle = window.getComputedStyle(document.documentElement);

const gridContainer = document.querySelector('.grid-container');

const gridContainerComputedStyle = window.getComputedStyle(gridContainer);
const gridContainerWidth = parseFloat(gridContainerComputedStyle.getPropertyValue('width'));
const gridContainerHeight = parseFloat(gridContainerComputedStyle.getPropertyValue('height'));

const canvas = document.getElementById('grid');
const cellDimension = 17;

let canvasWidth = gridContainerWidth - ((gridContainerWidth * 2) / 100);
let canvasHeight = gridContainerHeight - ((gridContainerHeight * 10) / 100);

const widthDifference = canvasWidth / cellDimension;
const heightDifference = canvasHeight / cellDimension;

// What is this and why do is it here? 
// Basically, the number of squares needed to fill the canvas, in most cases, is going to 
// be decimal. So I am adjusting the width and the height of the canvas to the cellDimension
// in order to have an integer number of squares both in length and width. 
canvasWidth -= (cellDimension * calculateDimensionDifference(canvasWidth, cellDimension));
canvasHeight -= (cellDimension * calculateDimensionDifference(canvasHeight, cellDimension));

canvas.setAttribute('width', `${canvasWidth}px`);
canvas.setAttribute('height', `${canvasHeight}px`);

const ctx = canvas.getContext('2d');

// dead cell style
const deadFillStyle = 'rgb(126, 126, 126)';
const deadStrokeStyle = 'white';
const aliveFillStyle = 'yellow';
const aliveStrokeStyle = deadFillStyle;

setCellStyle(deadFillStyle, deadStrokeStyle);
ctx.lineWidth = 1;

// calculate columns  and rows
const cols = canvasWidth / cellDimension; 
const rows = canvasHeight / cellDimension;
// generate grid

const cellMap = new Map(); 
let x, y, nCell = 0; 

for (let i = 0; i < rows; i++) {
	for (let j = 0; j < cols; j++) {
		x = j * cellDimension;
		y = i * cellDimension;

		drawSingleCell(x, y);
	}
}


canvas.addEventListener("click", function (e) {
	// Get the x and y position of the cursor inside the canvas
	const x = e.offsetX;
	const y = e.offsetY;

	const rowNumber = Math.ceil(y / cellDimension) - 1;
	const colNumber = Math.ceil(x / cellDimension) - 1;

	const originalX = colNumber * cellDimension;
	const originalY = rowNumber * cellDimension;

	let data = cellMap.get(originalX + "_" + originalY);

	if (data.state === "dead") {
		setCellStyle(aliveFillStyle, aliveStrokeStyle);
		data.state = "alive";
	} else {
		setCellStyle(deadFillStyle, deadStrokeStyle);
		data.state = "dead";
	}	

	drawSingleCell(originalX, originalY, data.state);
	console.log(countAliveNeighbours(originalX, originalY));
});


const playButton = document.getElementById("play-btn");
let playing = false, interval = null;

document.querySelector("button").addEventListener("click", function () {
	
	if (playing) {
		clearInterval(interval);
	} else {
		interval = setInterval(function () {
			console.log('calling');
			cellMap.forEach((value, key) => {
				key = key.split("_");
				evolve(parseInt(key[0]), parseInt(key[1]));
			})
		}, 750);
	}

	playing = !playing;
		
});