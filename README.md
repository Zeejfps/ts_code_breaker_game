# Code Breaker

A classic code-breaking puzzle game inspired by Mastermind. Guess the secret color code by using logic and deduction based on feedback from each attempt.

## Play Now

[Play Code Breaker](https://getreel.onelink.me/9d7T/esmy1rms)

## How to Play

1. A secret code of 4 colored pegs is generated
2. Make a guess by selecting colors for each position
3. Click "Check" to submit your guess
4. Feedback pegs indicate how close you are:
   - **Red** = correct color in the correct position
   - **White** = correct color but wrong position
   - **Empty** = color not in the code
5. Use the feedback to deduce the secret code before running out of attempts

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- TypeScript
- Vite
