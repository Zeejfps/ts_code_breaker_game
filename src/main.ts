import './style.css'
import { grid, type Peg, activeRowIndex, setActiveRowIndex } from './game'

const app = document.querySelector<HTMLDivElement>('#app')!

// Track selected color
let selectedColor: Peg = 'Red'

const availableColors: Peg[] = ['Red', 'Blue', 'Yellow', 'Green', 'Pink', 'White', 'Black', 'Purple']

// Track which rows have been checked
const checkedRows = new Set<number>()

function getPegColor(peg: Peg): string {
  const colorMap: Record<Peg, string> = {
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
  return colorMap[peg]
}

function renderPalette(container: HTMLElement) {
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
    palettePeg.style.backgroundColor = getPegColor(color)
    palettePeg.addEventListener('click', () => {
      handlePaletteClick(color)
    })

    palette.appendChild(palettePeg)
  })

  paletteContainer.appendChild(palette)
  container.appendChild(paletteContainer)
}

function handlePaletteClick(color: Peg) {
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

function renderGrid(container: HTMLElement) {
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
      pegElement.style.backgroundColor = getPegColor(pegValue)

      // Add empty class for visual distinction
      if (pegValue === 'None') {
        pegElement.classList.add('empty')
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
  pegElement.style.backgroundColor = getPegColor(selectedColor)

  // Remove empty class if it was empty
  if (pegElement.classList.contains('empty')) {
    pegElement.classList.remove('empty')
  }
}

function renderFeedback(feedbackArea: HTMLElement, _rowIndex: number) {
  // Clear any existing feedback
  feedbackArea.innerHTML = ''

  // Create small feedback pegs (placeholder logic - you'll customize this)
  const feedbackGrid = document.createElement('div')
  feedbackGrid.className = 'feedback-grid'
  feedbackGrid.style.gridTemplateColumns = `repeat(${grid.width}, 1fr)`

  // For now, just show random feedback as an example
  // In a real game, this would compare against the solution
  for (let i = 0; i < grid.width; i++) {
    const feedbackPeg = document.createElement('div')
    feedbackPeg.className = 'feedback-peg'

    // Placeholder: randomly show black, white, or empty
    const feedback = Math.random()
    if (feedback < 0.33) {
      feedbackPeg.style.backgroundColor = '#424242' // Black = correct position
    } else if (feedback < 0.66) {
      feedbackPeg.style.backgroundColor = '#ffffff' // White = correct color, wrong position
    } else {
      feedbackPeg.style.backgroundColor = '#555555' // Gray = incorrect
    }

    feedbackGrid.appendChild(feedbackPeg)
  }

  feedbackArea.appendChild(feedbackGrid)
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

function renderApp() {
  const mainContainer = document.createElement('div')
  mainContainer.className = 'main-container'

  renderGrid(mainContainer)
  renderPalette(mainContainer)

  app.appendChild(mainContainer)
}

// Initialize with empty grid
for (let y = 0; y < grid.height; y++) {
  for (let x = 0; x < grid.width; x++) {
    grid.set(x, y, 'None')
  }
}

renderApp()
