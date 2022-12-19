function convertCoordinatesToStr(x, y, separator = '_') {
	return x + separator + y;
}

function convertCoordinatesToNumber(coordinates, separator = '_') {
	const [x, y] = coordinates.split(separator);

	return [parseInt(x), parseInt(y)];
}

function drawBoard() {

	setCellStyle(deadFillStyle, deadStrokeStyle);

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			drawSingleCell(j * cellDimension, i * cellDimension);
		}
	}
}

function drawSingleCell(x, y, state = 'dead') {
	ctx.beginPath();
	ctx.moveTo(x, y);
	// This is going to be used to identify which cell the user has clicked on
	// and if it needs to be alive or dead.
	cellMap.set(convertCoordinatesToStr(x, y), { x: x, y: y, state: state });

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

	if ((neighbour = cellMap.get(convertCoordinatesToStr(x, y))))
		return neighbour.state === 'alive';

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
	if (checkIfNeighbourIsAlive(x, y + cellDimension)) aliveNeighbours++;

	if (checkIfNeighbourIsAlive(x, y - cellDimension)) aliveNeighbours++;

	if (checkIfNeighbourIsAlive(x + cellDimension, y)) aliveNeighbours++;

	if (checkIfNeighbourIsAlive(x - cellDimension, y)) aliveNeighbours++;

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

function evolve() {
	// To avoid the NaiveLife mistake, I need to first save all the current states
	// of every cell and the use those to generate the next population

	cellMap.forEach((cell, coordinates) => {
		const [x, y] = convertCoordinatesToNumber(coordinates);
		const aliveNeighbours = countAliveNeighbours(parseInt(x), parseInt(y));

		// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
		// Any live cell with two or three live neighbours lives on to the next generation.
		// Any live cell with more than three live neighbours dies, as if by overpopulation.
		// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction

		if (cell.state === 'alive') {
			if (aliveNeighbours === 2 || aliveNeighbours === 3) return;

			cell.changeTo = 'dead';
		} else {
			if (aliveNeighbours !== 3) return;

			cell.changeTo = 'alive';
		}
	});

	cellMap.forEach((cell, coordinates) => {
		if (!cell.hasOwnProperty('changeTo')) return;

		if (cell.changeTo === 'alive')
			setCellStyle(aliveFillStyle, aliveStrokeStyle);
		else setCellStyle(deadFillStyle, deadStrokeStyle);

		const [x, y] = convertCoordinatesToNumber(coordinates);
		drawSingleCell(x, y, cell.changeTo);

		delete cell.changeTo;
	});
}

// Get computed style for css variables
const computedStyle = window.getComputedStyle(document.documentElement);

const gridContainer = document.querySelector('.grid-container');

const gridContainerComputedStyle = window.getComputedStyle(gridContainer);
const gridContainerWidth = parseFloat(
	gridContainerComputedStyle.getPropertyValue('width')
);
const gridContainerHeight = parseFloat(
	gridContainerComputedStyle.getPropertyValue('height')
);

const canvas = document.getElementById('grid');
const cellDimension = 17;

let canvasWidth = gridContainerWidth - (gridContainerWidth * 2) / 100;
let canvasHeight = gridContainerHeight - (gridContainerHeight * 10) / 100;

const widthDifference = canvasWidth / cellDimension;
const heightDifference = canvasHeight / cellDimension;

// What is this and why do is it here?
// Basically, the number of squares needed to fill the canvas, in most cases, is going to
// be decimal. So I am adjusting the width and the height of the canvas to the cellDimension
// in order to have an integer number of squares both in length and width.
canvasWidth -= cellDimension * calculateDimensionDifference(canvasWidth, cellDimension);
canvasHeight -= cellDimension * calculateDimensionDifference(canvasHeight, cellDimension);

canvas.setAttribute('width', `${canvasWidth}px`);
canvas.setAttribute('height', `${canvasHeight}px`);

const ctx = canvas.getContext('2d');

// dead cell style
const deadFillStyle = 'rgb(126, 126, 126)';
const deadStrokeStyle = 'white';
const aliveFillStyle = 'yellow';
const aliveStrokeStyle = deadFillStyle;

ctx.lineWidth = 0.5;

// calculate columns  and rows
const cols = canvasWidth / cellDimension;
const rows = canvasHeight / cellDimension;
const cellMap = new Map();
// generate grid
drawBoard();

canvas.addEventListener('click', function (e) {
	// Get the x and y position of the cursor inside the canvas
	const x = e.offsetX;
	const y = e.offsetY;

	const rowNumber = Math.ceil(y / cellDimension) - 1;
	const colNumber = Math.ceil(x / cellDimension) - 1;

	const originalX = colNumber * cellDimension;
	const originalY = rowNumber * cellDimension;

	let data = cellMap.get(convertCoordinatesToStr(originalX, originalY));

	if (data.state === 'dead') {
		setCellStyle(aliveFillStyle, aliveStrokeStyle);
		data.state = 'alive';
	} else {
		setCellStyle(deadFillStyle, deadStrokeStyle);
		data.state = 'dead';
	}

	drawSingleCell(originalX, originalY, data.state);
});

const playButton = document.getElementById('play-btn');
const playButtonSpan = playButton.querySelector("span"); 
const playButtonIcon = playButton.querySelector("i");

let playing = false, interval = null;

playButton.addEventListener('click', function () {
	let addClass = 'pause', removeClass = 'play', text = 'Stop'; 

	if (playing) {
		clearInterval(interval);
		addClass = 'play';
		removeClass = 'pause';
		text = 'Play'; 
	} else {
		interval = setInterval(() => evolve(), 250);
		addClass = 'pause';
		removeClass = 'play';
		text = 'Stop'; 
	}

	playButtonSpan.innerText = text;
	playButtonIcon.classList.remove('fa-' + removeClass);
	playButtonIcon.classList.add('fa-' + addClass);

	playing = !playing;
});

const clearButton = document.getElementById('clear-btn');

clearButton.addEventListener('click', function () {
	
	if (playing)
		playButton.dispatchEvent(new Event('click'));
	
	drawBoard();
});