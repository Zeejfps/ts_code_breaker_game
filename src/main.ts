import './style.css'
import { grid, type HoleState, type Marble, activeRowIndex, setActiveRowIndex } from './game'

const app = document.querySelector<HTMLDivElement>('#app')!

// Track selected color
let selectedColor: Marble = 'Red'

const availableColors: Marble[] = ['Red', 'Blue', 'Yellow', 'Green', 'Pink', 'White', 'Black', 'Purple']

// Track which rows have been checked
const checkedRows = new Set<number>()

// Game solution - the secret code to guess
let solution: Marble[] = []

function getHoleColor(holeState: HoleState): string {
  const colorMap: Record<HoleState, string> = {
    'None': '#3a3a3a',
    'Red': '#ef5350',
    'Blue': '#42a5f5',
    'Yellow': '#ffeb3b',
    'Green': '#66bb6a',
    'Pink': '#ec407a',
    'White': '#ffffff',
    'Black': '#424242',
    'Purple': '#ab47bc'
  }
  return colorMap[holeState]
}

function buildPalette(container: HTMLElement) {
  const paletteContainer = document.createElement('div')
  paletteContainer.className = 'palette-container'

  const paletteTitle = document.createElement('div')
  paletteTitle.className = 'palette-title'
  paletteTitle.textContent = 'Select Color:'
  paletteContainer.appendChild(paletteTitle)

  const palette = document.createElement('div')
  palette.className = 'palette'

  availableColors.forEach(color => {
    const palettePeg = document.createElement('div')
    palettePeg.className = 'palette-peg'
    palettePeg.dataset.color = color
    if (color === selectedColor) {
      palettePeg.classList.add('selected')
    }
    palettePeg.style.backgroundColor = getHoleColor(color)
    palettePeg.addEventListener('click', () => {
      handlePaletteClick(color)
    })

    palette.appendChild(palettePeg)
  })

  paletteContainer.appendChild(palette)
  container.appendChild(paletteContainer)
}

function handlePaletteClick(color: Marble) {
  // Update selected color
  const previousColor = selectedColor
  selectedColor = color

  // Update palette pegs visual state
  const palette = document.querySelector('.palette')
  if (palette) {
    const prevPeg = palette.querySelector(`[data-color="${previousColor}"]`)
    const newPeg = palette.querySelector(`[data-color="${color}"]`)

    if (prevPeg) {
      prevPeg.classList.remove('selected')
    }
    if (newPeg) {
      newPeg.classList.add('selected')
    }
  }
}

function buildGrid(container: HTMLElement) {
  const gameBoard = document.createElement('div')
  gameBoard.className = 'game-board'

  for (let y = 0; y < grid.height; y++) {
    const rowContainer = document.createElement('div')
    rowContainer.className = 'row-container'

    // Highlight active row
    if (y === activeRowIndex) {
      rowContainer.classList.add('active')
    }

    // Create peg row
    const pegRow = document.createElement('div')
    pegRow.className = 'peg-row'

    for (let x = 0; x < grid.width; x++) {
      const pegElement = document.createElement('div')
      pegElement.className = 'peg'
      pegElement.dataset.x = String(x)
      pegElement.dataset.y = String(y)

      const pegValue = grid.get(x, y)
      pegElement.style.backgroundColor = getHoleColor(pegValue)

      // Add empty class for visual distinction, or placed class if it has a marble
      if (pegValue === 'None') {
        pegElement.classList.add('empty')
      } else {
        pegElement.classList.add('placed')
      }

      // Add inactive class if not in active row
      if (y !== activeRowIndex) {
        pegElement.classList.add('inactive')
      }

      // Add click handler for interactivity
      pegElement.addEventListener('click', () => {
        handlePegClick(x, y, pegElement)
      })

      pegRow.appendChild(pegElement)
    }

    // Create feedback area
    const feedbackArea = document.createElement('div')
    feedbackArea.className = 'feedback-area'
    feedbackArea.dataset.row = String(y)

    // Wrapper to contain both button and feedback in same space
    const checkWrapper = document.createElement('div')
    checkWrapper.className = 'check-wrapper'

    const isChecked = checkedRows.has(y)

    // Only show check button for active row if not already checked
    if (y === activeRowIndex && !isChecked) {
      const checkButton = document.createElement('button')
      checkButton.className = 'check-button'
      checkButton.textContent = 'Check'
      checkButton.addEventListener('click', () => {
        handleCheckRow(y, checkButton, feedbackArea)
      })
      checkWrapper.appendChild(checkButton)
    }

    // Show feedback if row has been checked
    if (isChecked) {
      renderFeedback(feedbackArea, y)
      feedbackArea.classList.add('visible')
    }

    checkWrapper.appendChild(feedbackArea)

    rowContainer.appendChild(pegRow)
    rowContainer.appendChild(checkWrapper)

    gameBoard.appendChild(rowContainer)
  }

  container.appendChild(gameBoard)
}

function handlePegClick(x: number, y: number, pegElement: HTMLElement) {
  // Only allow clicking pegs in the active row
  if (y !== activeRowIndex) {
    return
  }

  // Update grid state
  grid.set(x, y, selectedColor)

  // Update DOM directly
  pegElement.style.backgroundColor = getHoleColor(selectedColor)

  // Remove empty class and add placed class
  if (pegElement.classList.contains('empty')) {
    pegElement.classList.remove('empty')
  }
  pegElement.classList.add('placed')
}

function renderFeedback(feedbackArea: HTMLElement, rowIndex: number) {
  // Clear any existing feedback
  feedbackArea.innerHTML = ''

  // Get the current row's guesses
  const guess: HoleState[] = []
  for (let x = 0; x < grid.width; x++) {
    guess.push(grid.get(x, rowIndex))
  }

  // Calculate feedback
  const feedback = calculateFeedback(guess)

  // Create small feedback pegs
  const feedbackGrid = document.createElement('div')
  feedbackGrid.className = 'feedback-grid'
  feedbackGrid.style.gridTemplateColumns = `repeat(${grid.width}, 1fr)`

  // Display feedback: reds first, then whites, then grays
  for (let i = 0; i < grid.width; i++) {
    const feedbackPeg = document.createElement('div')
    feedbackPeg.className = 'feedback-peg'

    if (i < feedback.exactMatches) {
      // Red = correct position
      feedbackPeg.style.backgroundColor = '#ef5350'
    } else if (i < feedback.exactMatches + feedback.colorMatches) {
      // White = correct color, wrong position
      feedbackPeg.style.backgroundColor = '#ffffff'
    } else {
      // Gray = incorrect
      feedbackPeg.style.backgroundColor = '#555555'
    }

    feedbackGrid.appendChild(feedbackPeg)
  }

  feedbackArea.appendChild(feedbackGrid)
}

function calculateFeedback(guess: HoleState[]): { exactMatches: number; colorMatches: number } {
  let exactMatches = 0
  let colorMatches = 0

  // Track which positions in solution and guess have been matched
  const solutionUsed = new Array(solution.length).fill(false)
  const guessUsed = new Array(guess.length).fill(false)

  // First pass: find exact matches
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] !== 'None' && guess[i] === solution[i]) {
      exactMatches++
      solutionUsed[i] = true
      guessUsed[i] = true
    }
  }

  // Second pass: find color matches (right color, wrong position)
  for (let i = 0; i < guess.length; i++) {
    if (guessUsed[i] || guess[i] === 'None') continue

    for (let j = 0; j < solution.length; j++) {
      if (!solutionUsed[j] && guess[i] === solution[j]) {
        colorMatches++
        solutionUsed[j] = true
        break
      }
    }
  }

  return { exactMatches, colorMatches }
}

function handleCheckRow(rowIndex: number, checkButton: HTMLButtonElement, feedbackArea: HTMLElement) {
  // Mark row as checked
  checkedRows.add(rowIndex)

  // Hide the button with transition
  checkButton.classList.add('hidden')

  // Render the feedback
  renderFeedback(feedbackArea, rowIndex)
  feedbackArea.classList.add('visible')

  // Move to the next row (going upward, from bottom to top)
  if (rowIndex > 0) {
    const nextRowIndex = rowIndex - 1
    setActiveRowIndex(nextRowIndex)

    // Animate the transition
    animateRowTransition(rowIndex, nextRowIndex)
  }
}

function animateRowTransition(currentRowIndex: number, nextRowIndex: number) {
  const gameBoard = document.querySelector('.game-board')
  if (!gameBoard) return

  const rowContainers = gameBoard.querySelectorAll('.row-container')

  // Deactivate current row
  const currentRow = rowContainers[currentRowIndex] as HTMLElement
  if (currentRow) {
    currentRow.classList.remove('active')

    // Mark all pegs in current row as inactive
    const pegs = currentRow.querySelectorAll('.peg')
    pegs.forEach(peg => peg.classList.add('inactive'))
  }

  // Activate next row with a slight delay for animation effect
  setTimeout(() => {
    const nextRow = rowContainers[nextRowIndex] as HTMLElement
    if (nextRow) {
      nextRow.classList.add('active')

      // Mark all pegs in next row as active
      const pegs = nextRow.querySelectorAll('.peg')
      pegs.forEach(peg => peg.classList.remove('inactive'))

      // Add the check button to the next row
      const checkWrapper = nextRow.querySelector('.check-wrapper')
      if (checkWrapper && !checkedRows.has(nextRowIndex)) {
        const checkButton = document.createElement('button')
        checkButton.className = 'check-button'
        checkButton.textContent = 'Check'

        const feedbackArea = checkWrapper.querySelector('.feedback-area') as HTMLElement
        checkButton.addEventListener('click', () => {
          handleCheckRow(nextRowIndex, checkButton, feedbackArea)
        })

        // Insert button before feedback area
        checkWrapper.insertBefore(checkButton, feedbackArea)
      }
    }
  }, 200)
}

function buildApp() {
  const mainContainer = document.createElement('div')
  mainContainer.className = 'main-container'

  buildGrid(mainContainer)
  buildPalette(mainContainer)

  app.appendChild(mainContainer)
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function startGame() {
  // Clear checked rows
  checkedRows.clear()

  // Reset active row to bottom
  setActiveRowIndex(grid.height - 1)

  // Generate solution: pick grid.width random colors, each appearing once
  const shuffledColors = shuffleArray(availableColors)
  solution = shuffledColors.slice(0, grid.width)

  console.log('Solution:', solution) // For debugging

  grid.fill("None")

  // Build the UI
  buildApp()
}

startGame()
