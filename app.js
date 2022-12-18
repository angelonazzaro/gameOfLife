function calculateDimensionDifference(dim, cdim) {
	const difference = dim / cdim; 
	return difference - Math.floor(difference);
}

// get computed style for css variables
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

canvasWidth -= (cellDimension * calculateDimensionDifference(canvasWidth, cellDimension));
canvasHeight -= (cellDimension * calculateDimensionDifference(canvasHeight, cellDimension));

canvas.setAttribute('width', `${canvasWidth}px`);
canvas.setAttribute('height', `${canvasHeight}px`);

const ctx = canvas.getContext('2d');

// dead cell style
const deadFillStyle = 'rgb(126, 126, 126)';
const deadStrokeStyle = 'white';
const liveFillStyle = 'yellow';
const liveStrokeStyle = deadFillStyle;

ctx.fillStyle = deadFillStyle;
ctx.strokeStyle = deadStrokeStyle;
ctx.lineWidth = 1;

// generate grid
// calculate columns  and rows
const cols = canvasWidth / cellDimension; 
const rows = canvasHeight / cellDimension;

for (let i = 0; i < rows; i++) {
	for (let j = 0; j < cols; j++) {
		ctx.beginPath();
		ctx.moveTo(j * cellDimension, i * cellDimension);
		ctx.fillRect(j * cellDimension, i * cellDimension, cellDimension, cellDimension);
		ctx.strokeRect(j * cellDimension, i * cellDimension, cellDimension, cellDimension);
		ctx.closePath();
	}
}