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
    "Type help to get the available commands"
];

const OUTPUT_DELAY = 100;

function highlightCommands(text) {
    const commandNames = Object.keys(commands);
    if (commandNames.length === 0) return text;
    const commandRegex = new RegExp(`\\b(${commandNames.join('|')})\\b`, 'g');
    return text.replace(commandRegex, match => `<span class="command-highlight">${match}</span>`);
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
        const data = await response.json();
        commands = data.commands;
        commands.connect = new ConnectCommand();
        commands.weather = new WeatherCommand();
        await showWelcomeMessage();
    } catch (error) {
        console.error('Error loading commands:', error);
    }
}

function updateCursor() {
    const measureSpan = document.createElement('span');
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.position = 'absolute';
    measureSpan.style.whiteSpace = 'pre';
    measureSpan.style.font = window.getComputedStyle(input).font;
    measureSpan.textContent = input.value.slice(0, input.selectionStart);
    document.body.appendChild(measureSpan);
    
    const width = measureSpan.getBoundingClientRect().width;
    cursor.style.left = `${width}px`;
    
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
        const outputDiv = document.createElement('div');
        outputDiv.className = isError ? 'output error' : 'output';
        outputDiv.style.whiteSpace = 'pre';
        
        if (isHtml || command === 'connect') {
            outputDiv.innerHTML = output;
        } else {
            outputDiv.textContent = output;
        }
        
        history.insertBefore(outputDiv, history.firstChild);
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
        if (command === 'connect') {
            output = await cmd.execute();
            await addToHistory(command, output, false, true);
        } else if (cmd.output === 'dynamic') {
            if (command === 'help') {
                const commandList = Object.entries(commands)
                    .map(([name, cmd]) => ({
                        name: `<span class="command-highlight">${name}</span>`,
                        description: cmd.description
                    }));
                
                const maxLength = Math.max(...Object.keys(commands).map(name => name.length));
                
                output = commandList
                    .map(cmd => {
                        const plainName = cmd.name.replace(/<[^>]+>/g, '');
                        const padding = ' '.repeat(maxLength - plainName.length + 2);
                        return `${cmd.name}${padding}- ${cmd.description}`;
                    })
                    .join('\n');
                
                await addToHistory(command, output, false, true);
            } else if (command === 'weather') {
                try {
                    output = await cmd.execute(args);
                    await addToHistory(command, output);
                } catch (error) {
                    await addToHistory(command, error.message, true);
                }
            } else if (command === 'date') {
                output = new Date().toLocaleString();
                await addToHistory(command, output);
            } else {
                output = cmd.output;
                await addToHistory(command, output);
            }
        } else {
            output = cmd.output;
            await addToHistory(command, output);

            if (cmd.url) {
                window.open(cmd.url, '_blank');
            }
        }
    } else {
        await addToHistory(command, `Command not found: ${command}. Type 'help' for available commands.`, true);
    }
}


class ConnectCommand {
  constructor() {
      this.description = "Show my social media links";
      this.output = "dynamic";
  }

  async execute() {
    const links = [
        { platform: "X", url: "https://x.com/xvollhard" },
        { platform: "Email", url: "samrudh@duck.com", href: "mailto:samrudh@duck.com" },
        { platform: "LinkedIn", url: "https://linkedin.com/in/samrudh-yash" },
        { platform: "GitHub", url: "https://github.com/vollh4rD" },
        { platform: "Medium", url: "https://medium.com/@samrudhyash" }
    ];
  
    // Calculate the maximum length of the URLs
    const maxLength = Math.max(...links.map(link => link.url.length));
  
    const socialLinks = links.map(link => {
        const padding = ' '.repeat(maxLength - link.url.length + 3); // +2 for the space after the URL
        return `│  ${link.platform.padEnd(10)} : <a href="${link.href || link.url}" target="_blank" class="command-link">${link.url}</a>${padding}│`;
    }).join('\n');

      return `┌──────────────────────────────────────────────────────┐
│               Connect with me                        │
├──────────────────────────────────────────────────────┤
${socialLinks}
└──────────────────────────────────────────────────────┘`;
  }
}

// Event Listeners
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

input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const command = input.value;
        input.value = '';
        updateCursor();
        
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

window.addEventListener('click', () => {
    input.focus();
    if (!input.value && !isTyping) {
        cursor.classList.remove('typing', 'enter');
    }
});

function handleMobileKeyboard() {
    const viewheight = window.visualViewport.height;
    document.documentElement.style.height = `${viewheight}px`;
}

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleMobileKeyboard);
}

if ('ontouchstart' in window) {
    input.addEventListener('touchstart', (e) => {
        input.focus();
        e.preventDefault();
    });
}

// Initialize
loadCommands();
updateCursor();