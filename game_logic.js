const gameboard = document.getElementById("gameboard")

for (let i = 0; i < 36; i++) {

	let div = document.createElement("div")
	div.className = "box"
	div.id = i
	gameboard.appendChild(div)
}

let header = document.getElementById("header")
let restartBtn = document.getElementById("restartBtn")
let boxes = Array.from(document.getElementsByClassName("box"))
let display_x_points = document.getElementById("xpoints")
let display_o_points = document.getElementById("opoints")

let xWinnerIndicator = getComputedStyle(document.body).getPropertyValue("--x-winning-blocks")
let oWinnerIndicator = getComputedStyle(document.body).getPropertyValue("--o-winning-blocks")

const o_text = "O"
const x_text = "X"
let currentPlayer = x_text
let spaces = Array(36).fill(null)

let x_combos = []
let o_combos = []

let x_points = 0
let o_points = 0

const start = () => {
	boxes.forEach(box => box.addEventListener("click", boxClicked))
}

function boxClicked(e) {

	const id = e.target.id

	if (!spaces[id]) {
		spaces[id] = currentPlayer
		e.target.innerText = currentPlayer

		checkCombos(Number(id), currentPlayer)
		console.log("x combos: " + Array.from(x_combos))
		console.log("x points: " + x_points)
		console.log("o combos: " + Array.from(o_combos))
		console.log("o points: " + o_points)

		display_x_points.innerText = "X Points: " + x_points
		display_o_points.innerText = "O Points: " + o_points

		if (gameFinished()) {
			console.log("x points: " + x_points + " o points: " + o_points)
			if (x_points > o_points) {
				header.innerText = "X has won!"

			} else if (x_points < o_points) {
				header.innerText = "O has won!"

			} else {
				header.innerText = "It's a tie!"
			}
		}

		currentPlayer = currentPlayer == x_text ? o_text : x_text
	}
	
}

function checkCombos(space, player) {

	let potential_combos = []
	let distance = -7
	while (distance < 8) {

		let potential_box = space + distance
		if (potential_box >=0 && potential_box <= 35) {
			
			if (spaces[space] == spaces[potential_box]) {
				potential_combos.push(potential_box)
			}
		}

		if (distance == -5 || distance == 1) {
			distance += 4
		} else if (distance == -1) {
			distance += 2
		} else {
			distance += 1
		}
	}

	for (box of potential_combos) {

		let increment = box - space
		let potential_box = box + increment
		let potential_box2 = space - increment
		let sequence = [space, box]
		let keep_going = true

		for (i = 0; i < 7; i++) {

			if (potential_box >= 0 && potential_box <= 35 && keep_going) {

				let temp = []
				for (element of sequence) {
					temp.push(element)
				}
				temp.push(potential_box)
				temp.sort((a,b) => a-b)

				if (spaces[potential_box] == spaces[box] && checkSpacing(temp, increment)) {
	
					sequence.push(potential_box)
					sequence.sort((a, b) => a - b)

					potential_box += increment
	
				} else {
					keep_going = false
				}
			}
		}

		keep_going = true
		for (i = 0; i < 7; i++) {
			
			if (potential_box2 >= 0 && potential_box2 <= 35 && keep_going) {

				let temp = []
				for (element of sequence) {
					temp.push(element)
				}
				temp.push(potential_box2)
				temp.sort((a,b) => a-b)

				if (spaces[potential_box2] == spaces[box] && checkSpacing(temp, increment)) {
	
					sequence.push(potential_box2)
					sequence.sort((a, b) => a - b)
					potential_box2 -= increment
	
				} else {
					keep_going = false
				}
			}
		}
		
		if (sequence.length >= 3) {
			if (player == x_text && !containsCombo(x_combos, sequence)) {

				x_points = checkContainsSubset(x_combos, x_points, sequence)
				x_combos.push(sequence)

				sequence.forEach(box => boxes[box].style.backgroundColor=xWinnerIndicator)
				for (i = 1; i < sequence.length - 1; i++) {
					x_points += i
				}

			} else if (player == o_text && !containsCombo(o_combos, sequence)) {

				o_points = checkContainsSubset(o_combos, o_points, sequence)
				o_combos.push(sequence)

				sequence.forEach(box => boxes[box].style.backgroundColor=xWinnerIndicator)
				for (i = 1; i < sequence.length - 1; i++) {
					o_points += i
				}
			}
		}
	}
}

function checkContainsSubset(combo_list, combo_points, sequence) {

	for (element of combo_list) {

		let temp = []
		let j = 0
		for(i = 0; i < sequence.length; i++) {

			if (element[j] == sequence[i]) {

				temp.push(element[i])
				j++

				if (temp.length >= 3) {
					for (k = 1; k < element.length - 1; k++) {
						combo_points -= k
					}

					combo_list.splice(combo_list.indexOf(element), 1)
					return combo_points
				}

			} else {

				temp = []
				j = 0
			}
		}
	}

	return combo_points
}

function checkSpacing(sequence, increment) {

	if (sequence.length < 3) {
		return true
	}

	let rows = []
	let cols = []
	for (i = 0; i < sequence.length; i++) {
		rows.push(Math.floor(sequence[i] / 6))
		cols.push(sequence[i] % 6)
	}

	cols.sort((a,b) => a - b)
	

	if (increment == 1 || increment == -1) {

		for (i = 1; i < rows.length; i++) {

			if (rows[i] != rows[i-1]) {
				return false
			}
		}
		return true
		
	} else if (increment != 1 && increment != -1 && increment != 6 && increment != -6) {

		for (i = 1; i < rows.length; i++) {

			if (rows[i] != rows[i-1] + 1 || cols[i] != cols[i-1] + 1) {
				return false
			}
		}
		return true
	}

	return true
}

function compareSequences(sequence1, sequence2) {

	if (sequence1.length != sequence2.length) {
		return false
	}

	for (i = 0; i < sequence1.length; i++) {
		if (sequence1[i] != sequence2[i]) {
			return false
		}
	}

	return true
}

function containsCombo(combo_list, sequence) {

	for (combo of combo_list) {
		if (compareSequences(combo, sequence)) {
			return true
		}
	}

	return false
}

function gameFinished() {

	for (space of spaces) {

		if (!space) {
			return false
		}
	}

	return true
}

restartBtn.addEventListener("click", restart)

function restart() {

	boxes.forEach(box => box.innerText = "")
	boxes.forEach(box => box.style.backgroundColor="")
	currentPlayer = x_text
	spaces.fill(null)
	display_o_points.innerText = "O Points: 0"
	display_x_points.innerText = "X Points: 0"
	header.innerText = "6x6 Tic Tac Toe"

	x_combos = []
	o_combos = []
	x_points = 0
	o_points = 0
}

start()