import WeatherCommand from './weather.js';
let commands = {};
let commandHistory = [];
let historyIndex = -1;
let isTyping = false;
let typingTimer;

const input = document.getElementById('input');
const history = document.getElementById('history');
const cursor = document.querySelector('.cursor');
const TYPING_TIMEOUT = 1000;

const WELCOME_MESSAGES = [
    "Hey!",
    "You have landed on the website of Samrudh aka Vollhard",
    "Type 'help' to get the available commands"
];

const OUTPUT_DELAY = 100;

function highlightCommands(text) {
    const commandNames = Object.keys(commands);
    const commandRegex = new RegExp(`\\b(${commandNames.join('|')})\\b`, 'g');
    return text.replace(commandRegex, '<span class="command-highlight">$1</span>');
}

async function showWelcomeMessage(skipDelay = false) {
    const messages = [...WELCOME_MESSAGES];
    messages[messages.length - 1] = highlightCommands(messages[messages.length - 1]);
    
    for (let msg of messages) {
        await addToHistory('', msg, false, true);
        if (!skipDelay) {
            await new Promise(resolve => setTimeout(resolve, OUTPUT_DELAY));
        }
    }
}

async function loadCommands() {
    try {
        const response = await fetch('commands.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !data.commands) {
            throw new Error('Invalid commands data format');
        }
        commands = data.commands;
        commands.weather = new WeatherCommand();
        await showWelcomeMessage();
    } catch (error) {
        console.error('Error loading commands:', error);
        await addToHistory('', `Error loading commands: ${error.message}. Please refresh the page.`, true);
    }
}

function updateCursor() {
    // Create a temporary span to measure actual text width
    const measureSpan = document.createElement('span');
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.position = 'absolute';
    measureSpan.style.whiteSpace = 'pre';
    measureSpan.style.font = window.getComputedStyle(input).font;
    measureSpan.textContent = input.value.slice(0, input.selectionStart);
    document.body.appendChild(measureSpan);
    
    // Get the actual width and use it for cursor positioning
    const width = measureSpan.getBoundingClientRect().width;
    cursor.style.left = `${width}px`;
    
    // Clean up
    document.body.removeChild(measureSpan);
}

function addToHistory(command, output, isError = false, isHtml = false) {
    if (command) {
        const commandEntry = document.createElement('div');
        commandEntry.className = 'input-line';
        commandEntry.innerHTML = `<span class="prompt">user@samrudh.co ></span> ${command}`;
        history.insertBefore(commandEntry, history.firstChild);
    }
    
    if (output) {
        const lines = output.split('\n');
        return new Promise(async (resolve) => {
            for (let line of lines) {
                const outputDiv = document.createElement('div');
                outputDiv.className = isError ? 'output error' : 'output';
                if (isHtml) {
                    outputDiv.innerHTML = line;
                } else {
                    outputDiv.innerHTML = highlightCommands(line);
                }
                history.insertBefore(outputDiv, history.firstChild);
                await new Promise(resolve => setTimeout(resolve, OUTPUT_DELAY));
            }
            resolve();
        });
    }
    return Promise.resolve();
}

async function executeCommand(commandLine) {
  const [command, ...args] = commandLine.trim().split(' ');
  
  if (command === '') return;
  
  if (command === 'clear') {
      history.innerHTML = '';
      await showWelcomeMessage(true);
      return;
  }

  const cmd = commands[command];
  if (cmd) {
      let output;
      let isError = false;

      try {
          if (command === 'weather') {
              output = await cmd.execute(args);
          } else if (cmd.output === 'dynamic') {
              if (command === 'help') {
                  output = Object.entries(commands)
                      .map(([name, cmd]) => `${name.padEnd(10)} - ${cmd.description}`)
                      .join('\n');
              } else if (command === 'date') {
                  output = new Date().toLocaleString();
              } else if (command === 'echo') {
                  output = args.join(' ');
              }
          } else {
              output = cmd.output;
          }

          await addToHistory(commandLine, output, isError);
          
          if (cmd.url) {
              window.open(cmd.url, '_blank');
          }
      } catch (error) {
          console.error('Command error:', error);
          await addToHistory(commandLine, error.message, true);
      }
  } else {
      await addToHistory(commandLine, `Command not found: ${command}. Type 'help' for available commands.`, true);
  }
}


// Cursor state handling
input.addEventListener('input', () => {
    clearTimeout(typingTimer);
    cursor.classList.add('typing');
    cursor.classList.remove('enter');
    isTyping = true;
    
    typingTimer = setTimeout(() => {
        if (!input.value) {
            cursor.classList.remove('typing');
            isTyping = false;
        }
    }, 1000);
    
    updateCursor();
});

// Handle all keyboard events
input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const command = input.value;
        input.value = '';
        updateCursor();
        
        // Show enter state briefly
        cursor.classList.remove('typing');
        cursor.classList.add('enter');
        
        setTimeout(() => {
            cursor.classList.remove('enter');
        }, 200);
        
        commandHistory.push(command);
        historyIndex = commandHistory.length;
        await executeCommand(command);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
            updateCursor();
            cursor.classList.add('typing');
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            input.value = '';
        }
        updateCursor();
    }
});

// Focus handling
input.addEventListener('focus', () => {
    if (input.value) {
        cursor.classList.add('typing');
    }
});

input.addEventListener('blur', () => {
    if (!input.value) {
        cursor.classList.remove('typing', 'enter');
    }
});

// Keep input focused
window.addEventListener('click', () => {
    input.focus();
    if (!input.value && !isTyping) {
        cursor.classList.remove('typing', 'enter');
    }
});

// Handle typing state
function handleTyping() {
  clearTimeout(typingTimer);
  cursor.classList.add('typing');
  cursor.classList.remove('enter');
  
  // Set timer to return to blinking state after typing stops
  typingTimer = setTimeout(() => {
      if (!cursor.classList.contains('enter')) {
          cursor.classList.remove('typing');
      }
  }, TYPING_TIMEOUT);
}

// Update input handlers
input.addEventListener('input', () => {
  updateCursor();
  handleTyping();
});

// Handle mobile viewport changes
function handleMobileKeyboard() {
    const viewheight = window.visualViewport.height;
    document.documentElement.style.height = `${viewheight}px`;
}

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleMobileKeyboard);
}

// Add touch event handling for better mobile interaction
if ('ontouchstart' in window) {
    input.addEventListener('touchstart', (e) => {
        input.focus();
        e.preventDefault();
    });
}


// Initialize
loadCommands();
updateCursor();


