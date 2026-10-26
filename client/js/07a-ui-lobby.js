// client/js/07a-ui-lobby.js
// Giao dien phong cho Lobby DOM trong #ui-root (chon ten, mau sac, danh sach player, host control).
// Phu thuoc: client/js/00-boot.js, client/js/01-net.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  OP.UI = OP.UI || {};

  let lobbyRoot = null;
  let playerListEl = null;
  let hostPanelEl = null;
  let botInputEl = null;

  OP.UI.initLobby = function () {
    const uiRoot = document.getElementById('ui-root');
    if (!uiRoot) return;

    lobbyRoot = document.createElement('div');
    lobbyRoot.id = 'lobby-container';
    // Hien khi phase = LOBBY, an khi vao tran (server gui 'phase' ngay sau 'welcome')
    lobbyRoot.style.display = 'flex';

    // 1. Tieu de
    const titleEl = document.createElement('div');
    titleEl.className = 'lobby-title';
    titleEl.textContent = 'ONE PIECE BATTLEGROUND';
    lobbyRoot.appendChild(titleEl);

    // 2. Panel cai dat nhan vat
    const setupEl = document.createElement('div');
    setupEl.className = 'lobby-setup';

    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Tên Hải Tặc: ';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.maxLength = 24;
    nameInput.value = localStorage.getItem('op_name') || `Hải Tặc #${Math.floor(Math.random() * 900 + 100)}`;
    nameLabel.appendChild(nameInput);
    setupEl.appendChild(nameLabel);

    // Chon mau: non, ao, toc
    const colorsWrap = document.createElement('div');
    colorsWrap.className = 'lobby-colors';

    function createColorPicker(labelTxt, storageKey, defaultColor) {
      const wrap = document.createElement('span');
      wrap.className = 'color-item';
      const lbl = document.createElement('label');
      lbl.textContent = labelTxt + ' ';
      const inp = document.createElement('input');
      inp.type = 'color';
      inp.value = localStorage.getItem(storageKey) || defaultColor;
      lbl.appendChild(inp);
      wrap.appendChild(lbl);
      return { wrap, inp };
    }

    const hatColor = createColorPicker('Nón:', 'op_color_hat', '#d9534f');
    const shirtColor = createColorPicker('Áo:', 'op_color_shirt', '#337ab7');
    const hairColor = createColorPicker('Tóc:', 'op_color_hair', '#292b2c');

    colorsWrap.appendChild(hatColor.wrap);
    colorsWrap.appendChild(shirtColor.wrap);
    colorsWrap.appendChild(hairColor.wrap);
    setupEl.appendChild(colorsWrap);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'pixel-btn';
    saveBtn.textContent = 'CẬP NHẬT';
    saveBtn.onclick = function () {
      const newName = nameInput.value.trim() || 'Hải Tặc';
      localStorage.setItem('op_name', newName);
      localStorage.setItem('op_color_hat', hatColor.inp.value);
      localStorage.setItem('op_color_shirt', shirtColor.inp.value);
      localStorage.setItem('op_color_hair', hairColor.inp.value);

      OP.NET.send({
        t: 'join',
        name: newName,
        colors: {
          hat: hatColor.inp.value,
          shirt: shirtColor.inp.value,
          hair: hairColor.inp.value
        }
      });
    };
    setupEl.appendChild(saveBtn);
    lobbyRoot.appendChild(setupEl);

    // 3. Danh sach nguoi choi trong phong
    const listWrap = document.createElement('div');
    listWrap.className = 'lobby-list-wrap';
    const listTitle = document.createElement('div');
    listTitle.className = 'lobby-subtitle';
    listTitle.textContent = 'DANH SÁCH TRONG PHÒNG';
    listWrap.appendChild(listTitle);

    playerListEl = document.createElement('div');
    playerListEl.className = 'lobby-player-list';
    listWrap.appendChild(playerListEl);
    lobbyRoot.appendChild(listWrap);

    // 4. Panel danh rieng cho Host
    hostPanelEl = document.createElement('div');
    hostPanelEl.className = 'lobby-host-panel';
    hostPanelEl.style.display = 'none';

    const hostTitle = document.createElement('div');
    hostTitle.className = 'lobby-subtitle';
    hostTitle.textContent = 'ĐIỀU KHIỂN CỦA HOST';
    hostPanelEl.appendChild(hostTitle);

    const botWrap = document.createElement('div');
    botWrap.className = 'host-cfg-row';
    const botLbl = document.createElement('label');
    botLbl.textContent = 'Số lượng Bot: ';
    botInputEl = document.createElement('input');
    botInputEl.type = 'number';
    botInputEl.min = '0';
    botInputEl.max = '31';
    botInputEl.value = '31';
    botInputEl.onchange = function () {
      OP.NET.send({
        t: 'cfg',
        bots: parseInt(botInputEl.value, 10) || 0
      });
    };
    botLbl.appendChild(botInputEl);
    botWrap.appendChild(botLbl);
    hostPanelEl.appendChild(botWrap);

    const startBtn = document.createElement('button');
    startBtn.className = 'pixel-btn start-btn';
    startBtn.textContent = 'BẮT ĐẦU TRẬN';
    startBtn.onclick = function () {
      OP.NET.send({ t: 'start' });
    };
    hostPanelEl.appendChild(startBtn);
    lobbyRoot.appendChild(hostPanelEl);

    uiRoot.appendChild(lobbyRoot);

    // ==========================================
    // THANH CONG CU DEV (chi hien khi server chay --dev): dich chuyen 10 dao, an/hien phong
    // ==========================================
    const tpContainer = document.createElement('div');
    tpContainer.id = 'tp-container';
    tpContainer.style.display = 'none';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'tp-btn-group';

    const tpToggleBtn = document.createElement('button');
    tpToggleBtn.className = 'tp-toggle-btn';
    tpToggleBtn.textContent = 'DEV: ĐẢO';

    const lobbyToggleBtn = document.createElement('button');
    lobbyToggleBtn.className = 'tp-toggle-btn';
    lobbyToggleBtn.textContent = 'PHÒNG';
    lobbyToggleBtn.onclick = function () {
      lobbyRoot.style.display = (lobbyRoot.style.display === 'none' ? 'flex' : 'none');
    };

    btnGroup.appendChild(tpToggleBtn);
    btnGroup.appendChild(lobbyToggleBtn);
    tpContainer.appendChild(btnGroup);

    const tpPanel = document.createElement('div');
    tpPanel.className = 'tp-panel';
    tpPanel.style.display = 'none';

    const tpTitle = document.createElement('div');
    tpTitle.className = 'tp-panel-title';
    tpTitle.textContent = 'DỊCH CHUYỂN TỚI ĐẢO';
    tpPanel.appendChild(tpTitle);

    // Danh sach dao lay tu S.ISLANDS (khong dung emoji: icon phai la sprite pixel)
    const ISL = (window.OP_SHARED && window.OP_SHARED.ISLANDS) || {};
    Object.keys(ISL).forEach(function (id) {
      const btn = document.createElement('button');
      btn.className = 'tp-island-btn';
      btn.textContent = ISL[id].name;
      btn.onclick = function () {
        // Server xu ly dich chuyen (lenh dev /tp), client tu nhay theo snapshot
        OP.NET.send({ t: 'act', a: 'dev', arg: '/tp ' + id });
        tpPanel.style.display = 'none';
      };
      tpPanel.appendChild(btn);
    });

    tpToggleBtn.onclick = function () {
      tpPanel.style.display = (tpPanel.style.display === 'none' ? 'flex' : 'none');
    };

    tpContainer.appendChild(tpPanel);
    uiRoot.appendChild(tpContainer);

    // Lang nghe su kien tu mang
    OP.NET.on('welcome', function (msg) {
      if (msg.isHost) {
        hostPanelEl.style.display = 'block';
      }
      tpContainer.style.display = msg.dev ? 'flex' : 'none';
    });

    OP.NET.on('lobby', function (msg) {
      OP.UI.renderLobbyPlayers(msg);
    });

    OP.NET.on('phase', function (msg) {
      lobbyRoot.style.display = (msg.phase === 'LOBBY') ? 'flex' : 'none';
    });
  };

  OP.UI.renderLobbyPlayers = function (data) {
    if (!playerListEl) return;

    // Xoa danh sach cu
    while (playerListEl.firstChild) {
      playerListEl.removeChild(playerListEl.firstChild);
    }

    const youId = OP.NET.getYouId();
    const isHost = OP.NET.isHost();

    if (hostPanelEl) {
      hostPanelEl.style.display = isHost ? 'block' : 'none';
    }
    if (botInputEl && typeof data.bots === 'number') {
      botInputEl.value = data.bots;
    }

    if (!Array.isArray(data.players)) return;

    for (let i = 0; i < data.players.length; i++) {
      const p = data.players[i];
      const item = document.createElement('div');
      item.className = 'lobby-player-item';
      if (p.id === youId) {
        item.classList.add('me');
      }

      // Badge mau sac
      const badge = document.createElement('span');
      badge.className = 'player-badge';
      if (p.colors && p.colors.shirt) {
        badge.style.backgroundColor = p.colors.shirt;
      }
      item.appendChild(badge);

      // Ten nguoi choi (dung textContent theo luat code)
      const nameSpan = document.createElement('span');
      nameSpan.className = 'player-name';
      let nameText = p.name;
      if (p.isHost) {
        nameText += ' [HOST]';
      }
      if (p.id === youId) {
        nameText += ' (Bạn)';
      }
      nameSpan.textContent = nameText;
      item.appendChild(nameSpan);

      playerListEl.appendChild(item);
    }
  };
})();
