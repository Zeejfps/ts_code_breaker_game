import './style.css'
import { grid, type Peg } from './game'

const app = document.querySelector<HTMLDivElement>('#app')!

function getPegColor(peg: Peg): string {
  const colorMap: Record<Peg, string> = {
    'None': '#e0e0e0',
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

function renderGrid(container: HTMLElement) {
  container.innerHTML = ''

  const gameBoard = document.createElement('div')
  gameBoard.className = 'game-board'

  for (let y = 0; y < grid.height; y++) {
    const rowContainer = document.createElement('div')
    rowContainer.className = 'row-container'

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

      // Add click handler for interactivity
      pegElement.addEventListener('click', () => {
        handlePegClick(x, y)
      })

      pegRow.appendChild(pegElement)
    }

    // Create check button
    const checkButton = document.createElement('button')
    checkButton.className = 'check-button'
    checkButton.textContent = 'Check'
    checkButton.addEventListener('click', () => {
      handleCheckRow(y, checkButton, feedbackArea)
    })

    // Create feedback area (initially hidden)
    const feedbackArea = document.createElement('div')
    feedbackArea.className = 'feedback-area'
    feedbackArea.dataset.row = String(y)

    // Wrapper to contain both button and feedback in same space
    const checkWrapper = document.createElement('div')
    checkWrapper.className = 'check-wrapper'
    checkWrapper.appendChild(checkButton)
    checkWrapper.appendChild(feedbackArea)

    rowContainer.appendChild(pegRow)
    rowContainer.appendChild(checkWrapper)

    gameBoard.appendChild(rowContainer)
  }

  container.appendChild(gameBoard)
}

function handlePegClick(x: number, y: number) {
  // Cycle through colors for now (you can customize this logic)
  const colors: Peg[] = ['Red', 'Blue', 'Yellow', 'Green', 'Pink', 'White', 'Black', 'Purple', 'None']
  const currentPeg = grid.get(x, y)
  const currentIndex = colors.indexOf(currentPeg)
  const nextPeg = colors[(currentIndex + 1) % colors.length]

  grid.set(x, y, nextPeg)
  renderGrid(app)
}

function handleCheckRow(_rowIndex: number, checkButton: HTMLButtonElement, feedbackArea: HTMLElement) {
  // Hide the button
  checkButton.classList.add('hidden')

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
  feedbackArea.classList.add('visible')
}

// Initialize with empty grid
for (let y = 0; y < grid.height; y++) {
  for (let x = 0; x < grid.width; x++) {
    grid.set(x, y, 'None')
  }
}

renderGrid(app)
