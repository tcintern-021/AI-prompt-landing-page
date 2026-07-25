document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatWindow = document.getElementById('chatWindow');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const sendBtn = document.getElementById('sendBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const chips = document.querySelectorAll('.chip');
  
  // Persistent session ID
  const sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

  // Auto-focus input on startup
  chatInput.focus();

  // Auto-resize textarea dynamically
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
    sendBtn.disabled = chatInput.value.trim() === '';
  });

  // Handle Enter key (Shift+Enter for newline)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        chatForm.dispatchEvent(new Event('submit'));
      }
    }
  });

  // Handle suggestion chips click
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText) {
        chatInput.value = promptText;
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
        sendBtn.disabled = false;
        chatForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  // Form submission handler
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Reset input state
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Hide welcome screen on first prompt
    if (welcomeScreen) welcomeScreen.classList.add('hidden');

    // Render user message & trigger AI fetch
    appendMessage('user', text);
    await fetchAiResponse(text);
  });

  // Clear chat history handler
  clearChatBtn.addEventListener('click', () => {
    const messages = chatWindow.querySelectorAll('.message');
    messages.forEach(m => m.remove());
    if (welcomeScreen) welcomeScreen.classList.remove('hidden');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;
    chatInput.focus();
  });

  // DOM Helper: Create message bubble without circle avatars
  function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    if (role === 'user') {
      bubble.textContent = text;
    } else {
      // Add typing indicator dots initial placeholder
      bubble.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    }
    
    msgDiv.appendChild(bubble);
    chatWindow.appendChild(msgDiv);
    scrollToBottom();
    
    return bubble;
  }

  // Helper: Attach Copy buttons to all code (<pre>) blocks
  function attachCopyButtons(container) {
    const preBlocks = container.querySelectorAll('pre');
    preBlocks.forEach(pre => {
      if (pre.querySelector('.copy-code-btn')) return; // Already exists

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn';
      copyBtn.type = 'button';
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copy</span>
      `;

      copyBtn.addEventListener('click', () => {
        const codeElement = pre.querySelector('code');
        const textToCopy = codeElement ? codeElement.innerText : pre.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
          copyBtn.classList.add('copied');
          copyBtn.querySelector('span').textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.querySelector('span').textContent = 'Copy';
          }, 2000);
        });
      });

      pre.appendChild(copyBtn);
    });
  }

  // Helper: Smooth auto-scroll to bottom of chat
  function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Fetch AI Response with Streaming & Markdown Parsing
  async function fetchAiResponse(promptText) {
    const bubble = appendMessage('ai', '');
    
    try {
      const response = await fetch('/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, prompt: promptText })
      });

      if (!response.ok) {
        let errorMsg = 'Error fetching AI response.';
        try {
          const errData = await response.json();
          if (errData.detail) errorMsg = errData.detail;
        } catch (e) {}
        bubble.textContent = `Error: ${response.status} - ${errorMsg}`;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let fullText = "";
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        
        if (isFirstChunk) {
          bubble.innerHTML = ""; // Remove typing dots on first chunk arrival
          isFirstChunk = false;
        }

        // Render formatted markdown
        if (window.marked) {
          bubble.innerHTML = marked.parse(fullText);
        } else {
          bubble.textContent = fullText;
        }
        
        // Attach copy button to any code blocks present
        attachCopyButtons(bubble);
        
        scrollToBottom();
      }
    } catch (error) {
      bubble.textContent = `Connection error: ${error.message}`;
    }
  }
});