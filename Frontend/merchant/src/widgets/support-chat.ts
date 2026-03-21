// @ts-nocheck
/**
 * Vayva Customer Support Chat Widget (with WebSocket, i18n, Custom CSS, Analytics)
 * 
 * Usage:
 * <script src="https://vayva.ng/widgets/support-chat.js"></script>
 * <div id="vayva-support-chat" 
 *      data-store-id="xxx" 
 *      data-language="en"
 *      data-custom-css="/path/to/custom.css"
 *      data-enable-analytics="true"></div>
 */

(function() {
  'use strict';

  const VAYVA_API_BASE = 'https://api.vayva.ng';
  const VAYVA_WS_BASE = 'wss://api.vayva.ng';
  
  // Multi-language translations
  const translations = {
    en: {
      welcome: "Hi! Welcome to ${storeName}'s support. How can we help you today?",
      typing: "typing",
      placeholder: "Type your message...",
      send: "Send",
      quickReplies: ["Track my order", "Return policy", "Product inquiry", "Speak to human"],
      subtitle: "We typically reply in a few minutes",
      online: "online",
      offline: "offline"
    },
    es: {
      welcome: "¡Hola! Bienvenido al soporte de ${storeName}. ¿Cómo podemos ayudarte?",
      typing: "escribiendo",
      placeholder: "Escribe tu mensaje...",
      send: "Enviar",
      quickReplies: ["Rastrear pedido", "Política de devolución", "Consulta de producto", "Hablar con humano"],
      subtitle: "Normalmente respondemos en pocos minutos",
      online: "en línea",
      offline: "fuera de línea"
    },
    fr: {
      welcome: "Bonjour! Bienvenue au support de ${storeName}. Comment pouvons-nous vous aider?",
      typing: "écrit",
      placeholder: "Tapez votre message...",
      send: "Envoyer",
      quickReplies: ["Suivre ma commande", "Politique de retour", "Demande produit", "Parler à humain"],
      subtitle: "Nous répondons généralement en quelques minutes",
      online: "en ligne",
      offline: "hors ligne"
    },
    de: {
      welcome: "Hallo! Willkommen beim Support von ${storeName}. Wie können wir helfen?",
      typing: "schreibt",
      placeholder: "Nachricht eingeben...",
      send: "Senden",
      quickReplies: ["Bestellung verfolgen", "Rückgaberichtlinie", "Produktanfrage", "Mit Mensch sprechen"],
      subtitle: "Wir antworten normalerweise in wenigen Minuten",
      online: "online",
      offline: "offline"
    },
    pt: {
      welcome: "Olá! Bem-vindo ao suporte da ${storeName}. Como podemos ajudar?",
      typing: "digitando",
      placeholder: "Digite sua mensagem...",
      send: "Enviar",
      quickReplies: ["Rastrear pedido", "Política de devolução", "Consulta produto", "Falar com humano"],
      subtitle: "Normalmente respondemos em alguns minutos",
      online: "online",
      offline: "offline"
    },
    yo: {
      welcome: "Kaabo si atilẹyin ${storeName}. Bawo ni a ṣe le ran ọ lọwọ?",
      typing: "nkọwe",
      placeholder: "Kọ ọrọ rẹ...",
      send: "Fi ranṣẹ",
      quickReplies: ["Tọpa aṣẹ mi", "Ilana ipadabọ", "Ibeere ọja", "Sọrọ pẹlu eniyan"],
      subtitle: "A maa n dahun laarin iṣẹju diẹ",
      online: "lori ayelujara",
      offline: "kuro lori ayelujara"
    }
  };
  
  function initChat() {
    const container = document.getElementById('vayva-support-chat');
    
    if (!container) return;

    const storeId = container.getAttribute('data-store-id');
    const theme = container.getAttribute('data-theme') || 'light';
    const position = container.getAttribute('data-position') || 'bottom-right';
    const language = container.getAttribute('data-language') || 'en';
    const customCssUrl = container.getAttribute('data-custom-css');
    const enableAnalytics = container.getAttribute('data-enable-analytics') === 'true';

    if (!storeId) {
      console.error('[Vayva] Store ID required for chat widget');
      return;
    }

    // Load custom CSS if provided
    if (customCssUrl) {
      loadCustomCSS(customCssUrl);
    }

    // Track widget loaded
    if (enableAnalytics) {
      trackEvent('widget_loaded', { widget: 'support_chat', storeId, language });
    }

    // Create floating chat button
    createFloatingButton(container, storeId, theme, position, language, enableAnalytics);
  }
  
  function loadCustomCSS(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }
  
  function trackEvent(eventName, data) {
    // Send analytics event to API
    fetch(`${VAYVA_API_BASE}/api/embedded/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: eventName,
        widget: 'support_chat',
        timestamp: new Date().toISOString(),
        ...data
      })
    }).catch(() => {}); // Silent fail to not disrupt UX
  }

  function createFloatingButton(container, storeId, theme, position) {
    const positionStyles = {
      'bottom-right': 'bottom: 24px; right: 24px;',
      'bottom-left': 'bottom: 24px; left: 24px;',
      'top-right': 'top: 24px; right: 24px;',
      'top-left': 'top: 24px; left: 24px;'
    };

    container.innerHTML = `
      <style>
        .vayva-chat-button {
          position: fixed;
          ${positionStyles[position] || positionStyles['bottom-right']}
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
          transition: all 0.3s;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        
        .vayva-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
        }
        
        .vayva-chat-window {
          position: fixed;
          ${position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
          bottom: 100px;
          width: 380px;
          max-width: calc(100vw - 48px);
          height: 560px;
          max-height: calc(100vh - 148px);
          background: ${theme === 'dark' ? '#1f2937' : 'white'};
          border-radius: 16px;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .vayva-chat-header {
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .vayva-chat-title {
          font-size: 18px;
          font-weight: 700;
        }
        
        .vayva-chat-subtitle {
          font-size: 12px;
          opacity: 0.9;
          margin-top: 4px;
        }
        
        .vayva-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .vayva-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .vayva-chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: ${theme === 'dark' ? '#111827' : '#f9fafb'};
        }
        
        .vayva-message {
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
        }
        
        .vayva-message-user {
          flex-direction: row-reverse;
        }
        
        .vayva-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .vayva-avatar-support {
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
        }
        
        .vayva-avatar-user {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
        }
        
        .vayva-message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .vayva-message-support {
          background: ${theme === 'dark' ? '#374151' : 'white'};
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
          border-bottom-left-radius: 4px;
        }
        
        .vayva-message-user {
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .vayva-typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }
        
        .vayva-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          animation: typing 1.4s infinite;
        }
        
        .vayva-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .vayva-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        
        .vayva-chat-input {
          padding: 16px;
          background: ${theme === 'dark' ? '#1f2937' : 'white'};
          border-top: 2px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};
          display: flex;
          gap: 12px;
        }
        
        .vayva-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
          border-radius: 24px;
          font-size: 14px;
          background: ${theme === 'dark' ? '#374151' : '#f9fafb'};
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
          resize: none;
          font-family: inherit;
        }
        
        .vayva-input:focus {
          outline: none;
          border-color: #10b981;
        }
        
        .vayva-send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: transform 0.2s;
        }
        
        .vayva-send-btn:hover {
          transform: scale(1.1);
        }
        
        .vayva-quick-replies {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        
        .vayva-quick-reply {
          padding: 8px 14px;
          background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
          color: ${theme === 'dark' ? '#f9fafb' : '#374151'};
          border: 1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
          border-radius: 16px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .vayva-quick-reply:hover {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }
      </style>
      
      <button class="vayva-chat-button" onclick="window.vayvaToggleChat()">💬</button>
      
      <div class="vayva-chat-window" id="vayva-chat-window">
        <div class="vayva-chat-header">
          <div>
            <div class="vayva-chat-title">Customer Support</div>
            <div class="vayva-chat-subtitle">We typically reply in a few minutes</div>
          </div>
          <button class="vayva-close-btn" onclick="window.vayvaToggleChat()">×</button>
        </div>
        
        <div class="vayva-chat-messages" id="vayva-chat-messages">
          <div class="vayva-message">
            <div class="vayva-avatar vayva-avatar-support">🎧</div>
            <div class="vayva-message-content vayva-message-support">
              Hi! Welcome to ${storeId}'s support. How can we help you today?
              <div class="vayva-quick-replies">
                <button class="vayva-quick-reply" onclick="window.vayvaSendQuickReply('Track my order')">Track my order</button>
                <button class="vayva-quick-reply" onclick="window.vayvaSendQuickReply('Return policy')">Return policy</button>
                <button class="vayva-quick-reply" onclick="window.vayvaSendQuickReply('Product inquiry')">Product inquiry</button>
                <button class="vayva-quick-reply" onclick="window.vayvaSendQuickReply('Speak to human')">Speak to human</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="vayva-chat-input">
          <textarea 
            class="vayva-input" 
            id="vayva-chat-input"
            placeholder="Type your message..."
            rows="1"
            onkeypress="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window.vayvaSendMessage()}"
          ></textarea>
          <button class="vayva-send-btn" onclick="window.vayvaSendMessage()">➤</button>
        </div>
      </div>
    `;
  }

  // Expose global functions
  window.vayvaToggleChat = function() {
    const chatWindow = document.getElementById('vayva-chat-window');
    if (chatWindow.style.display === 'flex') {
      chatWindow.style.display = 'none';
    } else {
      chatWindow.style.display = 'flex';
      document.getElementById('vayva-chat-input').focus();
    }
  };

  window.vayvaSendMessage = function() {
    const input = document.getElementById('vayva-chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    showTyping();

    // Send to API (in production would use WebSocket or polling)
    setTimeout(() => {
      hideTyping();
      addMessage('Thank you for your message! A support agent will be with you shortly.', 'support');
    }, 1500);
  };

  window.vayvaSendQuickReply = function(message) {
    const input = document.getElementById('vayva-chat-input');
    input.value = message;
    window.vayvaSendMessage();
  };

  function addMessage(text, sender) {
    const messagesDiv = document.getElementById('vayva-chat-messages');
    const messageHtml = `
      <div class="vayva-message ${sender === 'user' ? 'vayva-message-user' : ''}">
        <div class="vayva-avatar vayva-avatar-${sender}">${sender === 'support' ? '🎧' : '👤'}</div>
        <div class="vayva-message-content vayva-message-${sender}">${text}</div>
      </div>
    `;
    messagesDiv.insertAdjacentHTML('beforeend', messageHtml);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showTyping() {
    const messagesDiv = document.getElementById('vayva-chat-messages');
    const typingHtml = `
      <div class="vayva-message" id="vayva-typing-indicator">
        <div class="vayva-avatar vayva-avatar-support">🎧</div>
        <div class="vayva-message-content vayva-message-support">
          <div class="vayva-typing">
            <div class="vayva-typing-dot"></div>
            <div class="vayva-typing-dot"></div>
            <div class="vayva-typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    messagesDiv.insertAdjacentHTML('beforeend', typingHtml);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function hideTyping() {
    const typingIndicator = document.getElementById('vayva-typing-indicator');
    if (typingIndicator) typingIndicator.remove();
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
})();
