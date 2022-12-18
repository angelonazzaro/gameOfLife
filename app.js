function setCellStyle(ctx, fillStyle, strokeStyle) {
	ctx.fillStyle = fillStyle;
	ctx.strokeStyle = strokeStyle;
}

function calculateDimensionDifference(dim, cdim) {
	const difference = dim / cdim; 
	// Returns the decimal part of the coefficient
	return difference - Math.floor(difference);
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

setCellStyle(ctx, deadFillStyle, deadStrokeStyle);
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

		ctx.beginPath();
		ctx.moveTo(x, y);
		// This is going to be used to identify which cell the user has clicked on
		// and if it needs to be alive or dead.
		cellMap.set(x + "" + y, "dead");

		ctx.fillRect(x, y, cellDimension, cellDimension);
		ctx.strokeRect(x, y, cellDimension, cellDimension);

		ctx.closePath();
	}
}


canvas.addEventListener("click", function (e) {
	const rect = canvas.getBoundingClientRect();
	// Get the x and y position of the cursor inside the canvas
	const x = e.offsetX;
	const y = e.offsetY;

	const rowNumber = Math.ceil(y / cellDimension) - 1;
	const colNumber = Math.ceil(x / cellDimension) - 1;

	const originalX = colNumber * cellDimension;
	const originalY = rowNumber * cellDimension;

	let cellState = cellMap.get(originalX + "" + originalY);

	if (cellState === "dead") {
		setCellStyle(ctx, aliveFillStyle, aliveStrokeStyle);
		cellState = "alive";
	} else {
		setCellStyle(ctx, deadFillStyle, deadStrokeStyle);
		cellState = "dead";
	}	

	ctx.beginPath();
	ctx.moveTo(originalX, originalY);

	cellMap.set(originalX + '' + originalY, cellState);

	ctx.fillRect(originalX, originalY, cellDimension, cellDimension);
	ctx.strokeRect(originalX, originalY, cellDimension, cellDimension);

	ctx.closePath();
});