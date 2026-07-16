// Ensure script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // 1. Element Selectors
  const promptForm = document.getElementById('promptForm');
  const promptInput = document.getElementById('promptInput');
  const errorMessage = document.getElementById('errorMessage');
  const outputConsole = document.getElementById('outputConsole');
  const emptyState = document.getElementById('emptyState');
  const clearBtn = document.getElementById('clearBtn');
  const clearOutputBtn = document.getElementById('clearOutputBtn');

  // 2. Event Listener for Form Submission
  promptForm.addEventListener('submit', (event) => {
    // Prevent the default browser reload on form submission
    event.preventDefault();

    // Retrieve input value and trim whitespace
    const promptValue = promptInput.value.trim();

    // 3. Validation Logic
    if (promptValue === '') {
      showValidationError(true);
      return; // Stop execution if empty
    }

    // If valid, clear any active validation errors
    showValidationError(false);

    // 4. Render Prompt to Output
    renderPrompt(promptValue);

    // Reset input form
    promptInput.value = '';
  });

  // 5. Clear Input Field Event
  clearBtn.addEventListener('click', () => {
    promptInput.value = '';
    showValidationError(false);
  });

  // 6. Clear Output History Event
  clearOutputBtn.addEventListener('click', () => {
    // Select all logs in the terminal
    const logs = outputConsole.querySelectorAll('.prompt-log');
    
    // Safely remove only the logged prompts, leaving the emptyState intact
    logs.forEach(log => log.remove());
    
    // Reveal the centered empty state cleanly via classes
    emptyState.classList.remove('hidden');
  });

  // Helper Function: Show or hide validation error
  function showValidationError(isError) {
    if (isError) {
      promptInput.classList.add('invalid');
      errorMessage.style.display = 'block';
    } else {
      promptInput.classList.remove('invalid');
      errorMessage.style.display = 'none';
    }
  }

  // Helper Function: Programmatically create & insert prompt logs in DOM
  function renderPrompt(text) {
    // Hide the empty state placeholder cleanly
    if (emptyState) {
      emptyState.classList.add('hidden');
    }

    // Create log wrapper
    const logWrapper = document.createElement('div');
    logWrapper.classList.add('prompt-log');

    // Generate metadata (Timestamp)
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Create meta layout
    const metaDiv = document.createElement('div');
    metaDiv.classList.add('log-meta');
    metaDiv.innerHTML = `<span>⚡ PROMPT_RUN</span> <span>${timestamp}</span>`;

    // Create content block
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('log-content');
    contentDiv.textContent = text; // Secures against XSS vulnerabilities

    // Assemble components
    logWrapper.appendChild(metaDiv);
    logWrapper.appendChild(contentDiv);

    // Append to output terminal log and auto-scroll to latest
    outputConsole.appendChild(logWrapper);
    outputConsole.scrollTop = outputConsole.scrollHeight;
  }
});