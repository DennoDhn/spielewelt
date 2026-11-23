const puzzleFrame = document.querySelector('#puzzleFrame');
const memoryGame = document.querySelector('main.game');
const puzzleButton = document.querySelector('#toPuzzle');
puzzleButton.onclick = () => {
  // Let the pending Memory celebration open before switching games.
  if (!memoryGame.querySelector('.tile:not(.matched)')) return;
  if (!puzzleFrame.hasAttribute('src')) puzzleFrame.src = './puzzle.html';
  memoryGame.inert = true;
  puzzleFrame.hidden = false;
  puzzleFrame.focus();
};
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== puzzleFrame.contentWindow || event.data !== 'open-memory') return;
  puzzleFrame.hidden = true;
  memoryGame.inert = false;
  puzzleButton.focus();
});
