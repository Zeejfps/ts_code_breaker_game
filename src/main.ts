import './style.css'
import {
  grid,
  type HoleState,
  type Marble,
  activeRowIndex,
  setActiveRowIndex,
  availableColors,
  solution,
  newGame
} from './game'

const app = document.querySelector<HTMLDivElement>('#app')!

// Track selected color
let selectedColor: Marble = 'Red'

// Track which rows have been checked
const checkedRows = new Set<number>()

function getHoleColor(holeState: HoleState): string {
  const colorMap: Record<HoleState, string> = {
    'None': '#3a3a3a',
    'Red': '#e60000',
    'Blue': '#42a5f5',
    'Yellow': '#ffeb3b',
    'Green': '#66bb6a',
    'Pink': '#ff1493',
    'White': '#ffffff',
    'Black': '#0a0a0a',
    'Purple': '#9c27b0'
  }
  return colorMap[holeState]
}

function buildPalette(container: HTMLElement) {
  const paletteContainer = document.createElement('div')
  paletteContainer.className = 'palette-container'

  const palette = document.createElement('div')
  palette.className = 'palette'

  const paletteTitle = document.createElement('div')
  paletteTitle.className = 'palette-title'
  paletteTitle.textContent = 'Select Color'
  palette.appendChild(paletteTitle)

  const paletteInner = document.createElement('div')
  paletteInner.className = 'palette-inner'

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

    paletteInner.appendChild(palettePeg)
  })

  palette.appendChild(paletteInner)

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

function createPegElement(x: number, y: number): HTMLElement {
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

  return pegElement
}

function createPegRow(y: number): HTMLElement {
  const pegRow = document.createElement('div')
  pegRow.className = 'peg-row'

  for (let x = 0; x < grid.width; x++) {
    const pegElement = createPegElement(x, y)
    pegRow.appendChild(pegElement)
  }

  return pegRow
}

function createCheckWrapper(y: number): HTMLElement {
  const checkWrapper = document.createElement('div')
  checkWrapper.className = 'check-wrapper'

  const feedbackArea = document.createElement('div')
  feedbackArea.className = 'feedback-area'
  feedbackArea.dataset.row = String(y)

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
  return checkWrapper
}

function createRowContainer(y: number): HTMLElement {
  const rowContainer = document.createElement('div')
  rowContainer.className = 'row-container'

  // Highlight active row
  if (y === activeRowIndex) {
    rowContainer.classList.add('active')
  }

  const pegRow = createPegRow(y)
  const checkWrapper = createCheckWrapper(y)

  rowContainer.appendChild(pegRow)
  rowContainer.appendChild(checkWrapper)

  return rowContainer
}

function buildGrid(container: HTMLElement) {
  const gameBoard = document.createElement('div')
  gameBoard.className = 'game-board'

  for (let y = 0; y < grid.height; y++) {
    const rowContainer = createRowContainer(y)
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

function getRowGuess(rowIndex: number): HoleState[] {
  const guess: HoleState[] = []
  for (let x = 0; x < grid.width; x++) {
    guess.push(grid.get(x, rowIndex))
  }
  return guess
}

function createFeedbackPeg(position: number, exactMatches: number, colorMatches: number): HTMLElement {
  const feedbackPeg = document.createElement('div')
  feedbackPeg.className = 'feedback-peg'

  if (position < exactMatches) {
    feedbackPeg.style.backgroundColor = '#ef5350' // Red = correct position
    feedbackPeg.classList.add('filled')
  } else if (position < exactMatches + colorMatches) {
    feedbackPeg.style.backgroundColor = '#ffffff' // White = correct color, wrong position
    feedbackPeg.classList.add('filled')
  } else {
    feedbackPeg.classList.add('empty') // Empty hole = incorrect
  }

  return feedbackPeg
}

function createFeedbackGrid(exactMatches: number, colorMatches: number): HTMLElement {
  const feedbackGrid = document.createElement('div')
  feedbackGrid.className = 'feedback-grid'
  feedbackGrid.style.gridTemplateColumns = `repeat(${grid.width}, 1fr)`

  for (let i = 0; i < grid.width; i++) {
    const feedbackPeg = createFeedbackPeg(i, exactMatches, colorMatches)
    feedbackGrid.appendChild(feedbackPeg)
  }

  return feedbackGrid
}

function renderFeedback(feedbackArea: HTMLElement, rowIndex: number) {
  feedbackArea.innerHTML = ''

  const guess = getRowGuess(rowIndex)
  const feedback = calculateFeedback(guess)
  const feedbackGrid = createFeedbackGrid(feedback.exactMatches, feedback.colorMatches)

  feedbackArea.appendChild(feedbackGrid)
}

function findExactMatches(
  guess: HoleState[],
  solutionUsed: boolean[],
  guessUsed: boolean[]
): number {
  let exactMatches = 0

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] !== 'None' && guess[i] === solution[i]) {
      exactMatches++
      solutionUsed[i] = true
      guessUsed[i] = true
    }
  }

  return exactMatches
}

function findColorMatches(
  guess: HoleState[],
  solutionUsed: boolean[],
  guessUsed: boolean[]
): number {
  let colorMatches = 0

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

  return colorMatches
}

function calculateFeedback(guess: HoleState[]): { exactMatches: number; colorMatches: number } {
  const solutionUsed = new Array(solution.length).fill(false)
  const guessUsed = new Array(guess.length).fill(false)

  const exactMatches = findExactMatches(guess, solutionUsed, guessUsed)
  const colorMatches = findColorMatches(guess, solutionUsed, guessUsed)

  return { exactMatches, colorMatches }
}

function processRowCheck(rowIndex: number): boolean {
  const guess = getRowGuess(rowIndex)
  const feedback = calculateFeedback(guess)
  return feedback.exactMatches === grid.width
}

function moveToNextRow(currentRowIndex: number) {
  const nextRowIndex = currentRowIndex - 1
  setActiveRowIndex(nextRowIndex)
  animateRowTransition(currentRowIndex, nextRowIndex)
}

function handleCheckRow(rowIndex: number, checkButton: HTMLButtonElement, feedbackArea: HTMLElement) {
  checkedRows.add(rowIndex)
  checkButton.classList.add('hidden')

  renderFeedback(feedbackArea, rowIndex)
  feedbackArea.classList.add('visible')

  const isVictory = processRowCheck(rowIndex)
  if (isVictory) {
    const guessCount = grid.height - rowIndex
    showVictoryDialog(guessCount)
    return
  }

  if (rowIndex > 0) {
    moveToNextRow(rowIndex)
  } else {
    // Last row and didn't win - show lose dialog after delay
    setTimeout(() => {
      showLoseDialog()
    }, 800)
  }
}

function deactivateRow(rowElement: HTMLElement) {
  rowElement.classList.remove('active')
  const pegs = rowElement.querySelectorAll('.peg')
  pegs.forEach(peg => peg.classList.add('inactive'))
}

function activateRow(rowElement: HTMLElement, rowIndex: number) {
  rowElement.classList.add('active')

  // Mark all pegs as active
  const pegs = rowElement.querySelectorAll('.peg')
  pegs.forEach(peg => peg.classList.remove('inactive'))

  // Add the check button
  const checkWrapper = rowElement.querySelector('.check-wrapper')
  if (checkWrapper && !checkedRows.has(rowIndex)) {
    const checkButton = document.createElement('button')
    checkButton.className = 'check-button'
    checkButton.textContent = 'Check'

    const feedbackArea = checkWrapper.querySelector('.feedback-area') as HTMLElement
    checkButton.addEventListener('click', () => {
      handleCheckRow(rowIndex, checkButton, feedbackArea)
    })

    checkWrapper.insertBefore(checkButton, feedbackArea)
  }
}

function animateRowTransition(currentRowIndex: number, nextRowIndex: number) {
  const gameBoard = document.querySelector('.game-board')
  if (!gameBoard) return

  const rowContainers = gameBoard.querySelectorAll('.row-container')
  const currentRow = rowContainers[currentRowIndex] as HTMLElement
  const nextRow = rowContainers[nextRowIndex] as HTMLElement

  if (currentRow) {
    deactivateRow(currentRow)
  }

  // Activate next row with a slight delay for animation effect
  setTimeout(() => {
    if (nextRow) {
      activateRow(nextRow, nextRowIndex)
    }
  }, 200)
}

function createRestartButton(): HTMLElement {
  const restartBtn = document.createElement('button')
  restartBtn.innerHTML = '<span>&#x21bb;</span>' // Circular arrow icon
  restartBtn.className = 'restart-button'
  restartBtn.title = 'Restart Game'
  restartBtn.addEventListener('click', () => {
    showRestartDialog()
  })
  return restartBtn
}

function createHelpButton(): HTMLElement {
  const helpBtn = document.createElement('button')
  helpBtn.innerHTML = '<span>?</span>'
  helpBtn.className = 'help-button'
  helpBtn.title = 'How to Play'
  helpBtn.addEventListener('click', () => {
    showHelpDialog()
  })
  return helpBtn
}

function createToolbar(): HTMLElement {
  const toolbar = document.createElement('div')
  toolbar.className = 'toolbar'

  const restartBtn = createRestartButton()
  const helpBtn = createHelpButton()

  toolbar.appendChild(restartBtn)
  toolbar.appendChild(helpBtn)

  return toolbar
}

function showHelpDialog() {
  const overlay = document.createElement('div')
  overlay.className = 'victory-overlay'

  const dialog = document.createElement('div')
  dialog.className = 'victory-dialog help-dialog'

  const title = document.createElement('h2')
  title.className = 'victory-title help-title'
  title.textContent = 'How to Play'

  const content = document.createElement('div')
  content.className = 'help-content'
  content.innerHTML = `
    <p><strong>Objective:</strong> Crack the secret ${grid.width}-color code in ${grid.height} guesses or fewer.</p>
    <div class="help-section">
      <h3>Playing</h3>
      <ul>
        <li>Select a color from the palette below</li>
        <li>Click an empty slot to place it</li>
        <li>Fill all slots, then press <span class="help-check">CHECK</span></li>
      </ul>
    </div>
    <div class="help-section">
      <h3>Feedback</h3>
      <ul>
        <li><span class="help-peg help-peg-correct"></span> = Correct color & position</li>
        <li><span class="help-peg help-peg-wrong"></span> = Correct color, wrong position</li>
        <li><span class="help-peg help-peg-empty"></span> = Color not in code</li>
      </ul>
    </div>
  `

  const closeBtn = document.createElement('button')
  closeBtn.className = 'play-again-button'
  closeBtn.textContent = 'Got it!'
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('visible')
    setTimeout(() => overlay.remove(), 300)
  })

  dialog.appendChild(title)
  dialog.appendChild(content)
  dialog.appendChild(closeBtn)
  overlay.appendChild(dialog)
  document.body.appendChild(overlay)

  requestAnimationFrame(() => {
    overlay.classList.add('visible')
  })
}

function createApp() {
  const mainContainer = document.createElement('div')
  mainContainer.className = 'main-container'

  const gameSection = document.createElement('div')
  gameSection.className = 'game-section'

  const toolbar = createToolbar()
  gameSection.appendChild(toolbar)

  buildGrid(gameSection)

  mainContainer.appendChild(gameSection)
  buildPalette(mainContainer)

  app.appendChild(mainContainer)
}

function createSolutionDisplay(): HTMLElement {
  const solutionContainer = document.createElement('div')
  solutionContainer.className = 'victory-solution'

  solution.forEach(color => {
    const marble = document.createElement('div')
    marble.className = 'victory-marble'
    marble.style.backgroundColor = getHoleColor(color)
    solutionContainer.appendChild(marble)
  })

  return solutionContainer
}

function createPlayAgainButton(overlay: HTMLElement): HTMLElement {
  const playAgainBtn = document.createElement('button')
  playAgainBtn.textContent = 'Play Again'
  playAgainBtn.className = 'play-again-button'
  playAgainBtn.addEventListener('click', () => {
    overlay.remove()
    animateClearBoard()
  })
  return playAgainBtn
}

function createVictoryDialog(guessCount: number): HTMLElement {
  const dialog = document.createElement('div')
  dialog.className = 'victory-dialog'

  const title = document.createElement('h2')
  title.textContent = '🎉 Victory! 🎉'
  title.className = 'victory-title'

  const message = document.createElement('p')
  message.textContent = 'You cracked the code!'
  message.className = 'victory-message'

  const stats = document.createElement('p')
  const guessText = guessCount === 1 ? 'guess' : 'guesses'
  stats.textContent = `Solved in ${guessCount} ${guessText}`
  stats.className = 'victory-stats'

  dialog.appendChild(title)
  dialog.appendChild(message)
  dialog.appendChild(stats)

  return dialog
}

function showVictoryDialog(guessCount: number) {
  const overlay = document.createElement('div')
  overlay.className = 'victory-overlay'

  const dialog = createVictoryDialog(guessCount)
  const solutionDisplay = createSolutionDisplay()
  const playAgainBtn = createPlayAgainButton(overlay)

  dialog.appendChild(solutionDisplay)
  dialog.appendChild(playAgainBtn)
  overlay.appendChild(dialog)
  document.body.appendChild(overlay)

  // Fade in animation
  setTimeout(() => {
    overlay.classList.add('visible')
  }, 10)
}

function createLoseDialog(): HTMLElement {
  const dialog = document.createElement('div')
  dialog.className = 'victory-dialog lose-dialog'

  const title = document.createElement('h2')
  title.textContent = '💔 Game Over 💔'
  title.className = 'victory-title lose-title'

  const message = document.createElement('p')
  message.textContent = 'Out of guesses! The solution was:'
  message.className = 'victory-message'

  dialog.appendChild(title)
  dialog.appendChild(message)

  return dialog
}

function createTryAgainButton(overlay: HTMLElement): HTMLElement {
  const tryAgainBtn = document.createElement('button')
  tryAgainBtn.textContent = 'Try Again'
  tryAgainBtn.className = 'play-again-button'
  tryAgainBtn.addEventListener('click', () => {
    overlay.remove()
    animateClearBoard()
  })
  return tryAgainBtn
}

function showLoseDialog() {
  const overlay = document.createElement('div')
  overlay.className = 'victory-overlay'

  const dialog = createLoseDialog()
  const solutionDisplay = createSolutionDisplay()
  const tryAgainBtn = createTryAgainButton(overlay)

  dialog.appendChild(solutionDisplay)
  dialog.appendChild(tryAgainBtn)
  overlay.appendChild(dialog)
  document.body.appendChild(overlay)

  // Fade in animation
  setTimeout(() => {
    overlay.classList.add('visible')
  }, 10)
}

function createRestartDialog(): HTMLElement {
  const dialog = document.createElement('div')
  dialog.className = 'victory-dialog restart-dialog'

  const title = document.createElement('h2')
  title.textContent = '⚠️ Restart Game?'
  title.className = 'victory-title restart-title'

  const message = document.createElement('p')
  message.textContent = 'Your current progress will be lost.'
  message.className = 'victory-message'

  dialog.appendChild(title)
  dialog.appendChild(message)

  return dialog
}

function createDialogButtons(overlay: HTMLElement, onConfirm: () => void): HTMLElement {
  const buttonContainer = document.createElement('div')
  buttonContainer.className = 'dialog-buttons'

  const cancelBtn = document.createElement('button')
  cancelBtn.textContent = 'Cancel'
  cancelBtn.className = 'dialog-button cancel-button'
  cancelBtn.addEventListener('click', () => {
    overlay.remove()
  })

  const confirmBtn = document.createElement('button')
  confirmBtn.textContent = 'Restart'
  confirmBtn.className = 'dialog-button confirm-button'
  confirmBtn.addEventListener('click', () => {
    overlay.remove()
    onConfirm()
  })

  buttonContainer.appendChild(cancelBtn)
  buttonContainer.appendChild(confirmBtn)

  return buttonContainer
}

function showRestartDialog() {
  const overlay = document.createElement('div')
  overlay.className = 'victory-overlay'

  const dialog = createRestartDialog()
  const buttons = createDialogButtons(overlay, () => {
    animateClearBoard()
  })

  dialog.appendChild(buttons)
  overlay.appendChild(dialog)
  document.body.appendChild(overlay)

  // Fade in animation
  setTimeout(() => {
    overlay.classList.add('visible')
  }, 10)
}

function animateClearBoard() {
  const gameBoard = document.querySelector('.game-board')
  if (!gameBoard) {
    startGame()
    return
  }

  // Disable restart button during animation
  const restartBtn = document.querySelector('.restart-button') as HTMLButtonElement
  if (restartBtn) {
    restartBtn.disabled = true
  }

  // Hide active row selection and check button
  const activeRow = gameBoard.querySelector('.row-container.active')
  if (activeRow) {
    activeRow.classList.remove('active')
    const checkButton = activeRow.querySelector('.check-button')
    if (checkButton) {
      checkButton.classList.add('hidden')
    }
  }

  const rows = gameBoard.querySelectorAll('.row-container')

  // Filter to only rows that have placed marbles
  const rowsWithMarbles: Array<{ row: Element; originalIndex: number }> = []
  rows.forEach((row, index) => {
    const marbles = row.querySelectorAll('.peg.placed')
    if (marbles.length > 0) {
      rowsWithMarbles.push({ row, originalIndex: index })
    }
  })

  // Animate rows from top to bottom, but only those with marbles
  rowsWithMarbles.forEach((rowData, delayIndex) => {
    setTimeout(() => {
      rowData.row.classList.add('clearing')

      // Animate only placed marbles (not empty holes) in the row
      const marbles = rowData.row.querySelectorAll('.peg.placed')
      marbles.forEach((marble: Element, marbleIndex) => {
        setTimeout(() => {
          const pegElement = marble as HTMLElement

          // Get the marble's current position and color
          const rect = pegElement.getBoundingClientRect()
          const currentColor = pegElement.style.backgroundColor

          // Create a duplicate marble for animation
          const duplicate = document.createElement('div')
          duplicate.className = 'peg-duplicate'
          duplicate.style.cssText = `
            position: fixed;
            top: ${rect.top}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            background-color: ${currentColor};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
          `

          // Add marble styling to duplicate
          duplicate.classList.add('filled')

          document.body.appendChild(duplicate)

          // Convert original to hole immediately
          pegElement.style.backgroundColor = getHoleColor('None')
          pegElement.classList.remove('placed')
          pegElement.classList.add('empty')

          // Animate the duplicate away
          requestAnimationFrame(() => {
            duplicate.classList.add('clear-out')

            // Remove duplicate after animation
            setTimeout(() => {
              duplicate.remove()
            }, 500)
          })
        }, marbleIndex * 30)
      })
    }, delayIndex * 80)
  })

  // Wait for all animations to complete, then start new game
  const totalAnimationTime = (rowsWithMarbles.length * 80) + (grid.width * 30) + 500
  setTimeout(() => {
    // Re-enable restart button
    const restartBtn = document.querySelector('.restart-button') as HTMLButtonElement
    if (restartBtn) {
      restartBtn.disabled = false
    }
    startGame()
  }, totalAnimationTime)
}

function startGame() {
  // Clear checked rows
  checkedRows.clear()

  newGame()

  // Clear and rebuild the UI
  destroyApp()
  createApp()
}

function destroyApp() {
  app.innerHTML = ''
}

startGame()
