//get gameboard div
const gameboard = document.getElementById("gameboard")

//add 36 spaces to the gameboard each with a numbered id
for (let i = 0; i < 36; i++) {

	let div = document.createElement("div")
	div.className = "box"
	div.id = i
	gameboard.appendChild(div)
}

//get title header, restart button, all boxes, x points, and y points
let header = document.getElementById("header")
let restartBtn = document.getElementById("restartBtn")
let boxes = Array.from(document.getElementsByClassName("box"))
let display_x_points = document.getElementById("xpoints")
let display_o_points = document.getElementById("opoints")

//get color for winning groups
let xWinnerIndicator = getComputedStyle(document.body).getPropertyValue("--x-winning-blocks")
let oWinnerIndicator = getComputedStyle(document.body).getPropertyValue("--o-winning-blocks")

const o_text = "O"
const x_text = "X"

//start off with player X
let currentPlayer = x_text
let spaces = Array(36).fill(null)

let x_combos = []
let o_combos = []

let x_points = 0
let o_points = 0

//add an event for when each box is clicked
const start = () => {
	boxes.forEach(box => box.addEventListener("click", boxClicked))
}

//function for when each box is clicked
function boxClicked(e) {

	const id = e.target.id

	//if box isn't empty, set populate the box with the player
	if (!spaces[id]) {
		spaces[id] = currentPlayer
		e.target.innerText = currentPlayer

		//check if marking that box made a group
		checkCombos(Number(id), currentPlayer)

		//update the points displayed
		display_x_points.innerText = "X Points: " + x_points
		display_o_points.innerText = "O Points: " + o_points

		//check if the game is finished and change title accordingly
		if (gameFinished()) {

			if (x_points > o_points) {
				header.innerText = "X has won!"

			} else if (x_points < o_points) {
				header.innerText = "O has won!"

			} else {
				header.innerText = "It's a tie!"
			}
		}

		//change player
		currentPlayer = currentPlayer == x_text ? o_text : x_text
	}
	
}

//check if the space is a part of a group
function checkCombos(space, player) {

	let potential_combos = []
	let distance = -7
	//check each of the surrounding 8 boxes of the given space
	while (distance < 8) {

		let potential_box = space + distance
		if (potential_box >=0 && potential_box <= 35) {
			
			//if box matches the space, add it to a list of potential groups
			if (spaces[space] == spaces[potential_box]) {
				potential_combos.push(potential_box)
			}
		}

		//look at the next box accordingly
		if (distance == -5 || distance == 1) {
			distance += 4
		} else if (distance == -1) {
			distance += 2
		} else {
			distance += 1
		}
	}

	//for each box that is in the potential groups list
	for (box of potential_combos) {

		//save the distance b/w the box and space, the next forward/behind boxes to check, and make a list of them
		let increment = box - space
		let potential_box = box + increment
		let potential_box2 = space - increment
		let sequence = [space, box]
		let keep_going = true

		//loop to check the potential boxes in the forward direction
		for (i = 0; i < 7; i++) {

			//if the next forward box in the row is valid
			if (potential_box >= 0 && potential_box <= 35 && keep_going) {

				//add it and the already matched boxes to a list and sort it
				let temp = []
				for (element of sequence) {
					temp.push(element)
				}
				temp.push(potential_box)
				temp.sort((a,b) => a-b)

				//if the next forward box is of the same player and the spacing is right
				if (spaces[potential_box] == spaces[box] && checkSpacing(temp, increment)) {
	
					//add it to the group and sort
					sequence.push(potential_box)
					sequence.sort((a, b) => a - b)

					//increment to look at the next forward box for the next iteration
					potential_box += increment
	
				//if next forward box isn't the same player, end the loop
				} else {
					keep_going = false
				}
			}
		}

		keep_going = true
		//loop to check the potential boxes in the backward direction
		for (i = 0; i < 7; i++) {
			
			//if the next backward box in the row is valid
			if (potential_box2 >= 0 && potential_box2 <= 35 && keep_going) {

				//add it and the already matched boxes to a list and sort it
				let temp = []
				for (element of sequence) {
					temp.push(element)
				}
				temp.push(potential_box2)
				temp.sort((a,b) => a-b)

				//if the next backward box is of the same player and the spacing is right
				if (spaces[potential_box2] == spaces[box] && checkSpacing(temp, increment)) {
	
					//add it to the group and sort
					sequence.push(potential_box2)
					sequence.sort((a, b) => a - b)

					//increment to look at the next backward box for the next iteration
					potential_box2 -= increment
	
				//if next backward box isn't the same player, end the loop
				} else {
					keep_going = false
				}
			}
		}
		
		//if the group list has at least 3 boxes in it, check that the respective player doesn't already contain the group
		if (sequence.length >= 3) {

			if (player == x_text && !containsCombo(x_combos, sequence)) {

				//check if the group is an extension of a previous group and add it to the combo list
				x_points = checkContainsSubset(x_combos, x_points, sequence)
				x_combos.push(sequence)

				//highlight all the boxes in the group and increase points accordingly
				sequence.forEach(box => boxes[box].style.backgroundColor=xWinnerIndicator)
				for (i = 1; i < sequence.length - 1; i++) {
					x_points += i
				}

			} else if (player == o_text && !containsCombo(o_combos, sequence)) {

				//check if the group is an extension of a previous group and add it to the combo list
				o_points = checkContainsSubset(o_combos, o_points, sequence)
				o_combos.push(sequence)

				//highlight all the boxes in the group and increase points accordingly
				sequence.forEach(box => boxes[box].style.backgroundColor=xWinnerIndicator)
				for (i = 1; i < sequence.length - 1; i++) {
					o_points += i
				}
			}
		}
	}
}

/**
 * Check if the group is an extension of a previous group. An extension can be if the if all of an old combo match
 * the beginning of the new group, or if at least the last 3 of the old combo matches the beginning of the new group.
 */
function checkContainsSubset(combo_list, combo_points, sequence) {

	//for each group in the combo list
	for (element of combo_list) {

		let temp = []
		let j = 0
		//loop through the newly added group
		for(i = 0; i < sequence.length; i++) {

			//if the box of the new group matches the box of the old, add it to the temp list
			if (element[j] == sequence[i]) {

				temp.push(element[i])
				j++

				//if size of the matching boxes is at least 3, then the new group is an extension
				if (temp.length >= 3) {
					//remove the points from the old group
					for (k = 1; k < element.length - 1; k++) {
						combo_points -= k
					}

					//remove the old group from the combo list
					combo_list.splice(combo_list.indexOf(element), 1)
					
					//return the points without the old group
					return combo_points
				}

			//if a box of the new group doesn't match the box of the old, reset the temp list and start
			//from the beginning of the old group again to check for another extension
			} else {

				temp = []
				j = 0
			}
		}
	}

	//return points
	return combo_points
}

//checks the spacing for a group of boxes
function checkSpacing(sequence, increment) {

	//if group isn't at least 3, ignore
	if (sequence.length < 3) {
		return true
	}

	//list the row and column numbers for each box in the group
	let rows = []
	let cols = []
	for (i = 0; i < sequence.length; i++) {
		rows.push(Math.floor(sequence[i] / 6))
		cols.push(sequence[i] % 6)
	}

	//sort the column numbers
	cols.sort((a,b) => a - b)
	
	//if the group is a row of boxes
	if (increment == 1 || increment == -1) {

		//make sure that the row of each box is the same (doesn't wrap around the gameboard horizontally)
		for (i = 1; i < rows.length; i++) {

			if (rows[i] != rows[i-1]) {
				return false
			}
		}
		return true
		
	//if the group is a diagonal of boxes
	} else if (increment != 1 && increment != -1 && increment != 6 && increment != -6) {

		//make sure that the rows and columns of each box is 1 greater than the previous box's row and column
		for (i = 1; i < rows.length; i++) {

			if (rows[i] != rows[i-1] + 1 || cols[i] != cols[i-1] + 1) {
				return false
			}
		}
		return true
	}

	//if it's a column of boxes return true because the game doesn't allow for wrapping vertically
	return true
}

//compare two groups of boxes
function compareSequences(sequence1, sequence2) {

	//return false if they aren't the same length
	if (sequence1.length != sequence2.length) {
		return false
	}

	//for each box in the lists, check that they are the same
	for (i = 0; i < sequence1.length; i++) {
		if (sequence1[i] != sequence2[i]) {
			return false
		}
	}

	return true
}

//check if a combo list already contains a group
function containsCombo(combo_list, sequence) {

	//loop through the combo list and compare each combo with the given group
	for (combo of combo_list) {
		if (compareSequences(combo, sequence)) {
			return true
		}
	}

	return false
}

//check if the board is filled
function gameFinished() {

	//loop through the boxes on the board and check if any are empty
	for (space of spaces) {

		if (!space) {
			return false
		}
	}

	return true
}

//add a click event to the restart button
restartBtn.addEventListener("click", restart)

//restarts the game upon button click
function restart() {

	//make each box empty and remove all group highlighting
	boxes.forEach(box => box.innerText = "")
	boxes.forEach(box => box.style.backgroundColor="")
	
	//reset the first player and empty the list of boxes
	currentPlayer = x_text
	spaces.fill(null)

	//reset the points displays and the title
	display_o_points.innerText = "O Points: 0"
	display_x_points.innerText = "X Points: 0"
	header.innerText = "6x6 Tic Tac Toe"

	x_combos = []
	o_combos = []
	x_points = 0
	o_points = 0
}

//start the game
start()