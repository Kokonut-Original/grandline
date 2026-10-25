// client/js/07d-ui-chat.js
// Hop chat DOM tren giao dien, gui va hien thi tin nhan dung textContent.
// Phu thuoc: client/js/00-boot.js, client/js/01-net.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  OP.UI = OP.UI || {};

  let chatBoxEl = null;
  let chatMessagesEl = null;
  let chatInputEl = null;

  OP.UI.initChat = function () {
    const uiRoot = document.getElementById('ui-root');
    if (!uiRoot) return;

    chatBoxEl = document.createElement('div');
    chatBoxEl.id = 'chat-container';

    chatMessagesEl = document.createElement('div');
    chatMessagesEl.className = 'chat-messages';
    chatBoxEl.appendChild(chatMessagesEl);

    const inputWrap = document.createElement('div');
    inputWrap.className = 'chat-input-wrap';

    chatInputEl = document.createElement('input');
    chatInputEl.type = 'text';
    chatInputEl.maxLength = 120;
    chatInputEl.placeholder = 'Nhấn Enter để chat...';
    chatInputEl.className = 'chat-input';

    chatInputEl.onkeydown = function (e) {
      if (e.key === 'Enter') {
        const text = chatInputEl.value.trim();
        if (text) {
          OP.NET.send({
            t: 'chat',
            text: text
          });
          chatInputEl.value = '';
        }
        chatInputEl.blur();
      }
    };

    inputWrap.appendChild(chatInputEl);
    chatBoxEl.appendChild(inputWrap);
    uiRoot.appendChild(chatBoxEl);

    // Xu ly phim Enter toan cuc de mo chat input
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && document.activeElement !== chatInputEl) {
        chatInputEl.focus();
        e.preventDefault();
      }
    });

    // Lang nghe tin nhan chat tu server
    OP.NET.on('chat', function (msg) {
      OP.UI.addChatMessage(msg.from, msg.text);
    });
  };

  OP.UI.addChatMessage = function (from, text) {
    if (!chatMessagesEl) return;

    const line = document.createElement('div');
    line.className = 'chat-line';

    const authorSpan = document.createElement('span');
    authorSpan.className = 'chat-author';
    authorSpan.textContent = `[${from}]: `; // Dung textContent theo quy dinh
    line.appendChild(authorSpan);

    const textSpan = document.createElement('span');
    textSpan.className = 'chat-text';
    textSpan.textContent = text; // Dung textContent de phong chong XSS
    line.appendChild(textSpan);

    chatMessagesEl.appendChild(line);

    // Tu dong cuon xuong tin nhan moi nhat
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

    // Gioi han 50 dong chat
    while (chatMessagesEl.children.length > 50) {
      chatMessagesEl.removeChild(chatMessagesEl.firstChild);
    }
  };
})();
