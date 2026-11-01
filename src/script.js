function initOptionsDialog() {
    const dialog = document.getElementById('options-dialog');
    if (!dialog) return null;

    // Spraypaint image name → filename map
    var SPRAY_IMAGES = {
        'buzzcut':    'images/buzz cut mode.jpg',
        'does_the_hat': 'images/hat mode.jpg',
        'long_hair':  'images/Long hair mode.jpg',
        'misty':      'images/Misty.jpg',
        'dusty':      'images/Dusty.jpg'
    };
    var FILTER_CLASSES = ['filter-none', 'filter-orange', 'filter-yellow', 'filter-ltblue', 'filter-green'];

    var previewImg = dialog.querySelector('#spraypaint-preview-img');
    var imgSelect  = dialog.querySelector('#spraypaint-image');
    var filterSel  = dialog.querySelector('#spraypaint-filter');
    var ageRange   = dialog.querySelector('#age-range');
    var ageValue   = dialog.querySelector('#age-value');

    function updatePreview() {
        if (!previewImg) return;
        var src = SPRAY_IMAGES[imgSelect.value] || '';
        previewImg.style.backgroundImage = src ? 'url("' + src + '")' : 'none';
        FILTER_CLASSES.forEach(function(c) { previewImg.classList.remove(c); });
        if (filterSel.value !== 'none') previewImg.classList.add('filter-' + filterSel.value);

        // Misty and Dusty are 4 years old
        var age = (imgSelect.value === 'misty' || imgSelect.value === 'dusty') ? 4 : 19;
        if (ageRange) ageRange.value = age;
        if (ageValue) ageValue.value = age;
    }

    if (imgSelect)  imgSelect.addEventListener('change', updatePreview);
    if (filterSel)  filterSel.addEventListener('change', updatePreview);
    updatePreview(); // set initial state

    // Dialog closing is natively handled by <form method="dialog"> and global .close handler

    return dialog;
}

function initNewGameDialog() {
    const dialog = document.getElementById('new-game-dialog');
    if (!dialog) return null;

    const goSound = new Audio('sounds/go.wav');

    dialog.querySelector('#new-game-start').addEventListener('click', function () {
        dialog.close();
        goSound.currentTime = 0;
        goSound.play();
    });

    // Dialog closing is natively handled by <form method="dialog"> and global .close handler

    return dialog;
}

function initQuitDialog() {
    const dialog = document.getElementById('quit-dialog');
    if (!dialog) return null;

    dialog.querySelector('#confirm-quit').addEventListener('click', function () {
        window.location.href = 'https://github.com/000wahab000';
    });

    dialog.querySelector('#quit-cancel').addEventListener('click', function () {
        dialog.close();
    });

    return dialog;
}

function initServersDialog() {
    const dialog = document.getElementById('servers-dialog');
    if (!dialog) return null;

    const serverItems = dialog.querySelectorAll('.server-item');
    const connectBtn = dialog.querySelector('#connect-btn');
    const refreshBtn = dialog.querySelector('#refresh-btn');

    let selectedServer = null;
    function selectServer(serverItem) {
        serverItems.forEach(item => item.classList.remove('selected'));
        serverItem.classList.add('selected');
        selectedServer = serverItem;
        connectBtn.disabled = false;
    }

    serverItems.forEach(item => {
        item.addEventListener('click', function () {
            selectServer(this);
        });

        item.addEventListener('dblclick', function () {
            const url = this.getAttribute('data-url');
            window.open(url, '_blank', 'noopener');
        });
    });

    connectBtn.addEventListener('click', function () {
        if (selectedServer) {
            const url = selectedServer.getAttribute('data-url');
            window.open(url, '_blank', 'noopener');
        }
    });

    refreshBtn.addEventListener('click', function () {
        refreshBtn.disabled = true;

        const serverCountElement = dialog.querySelector('.server-list-header .project-description-column');

        serverItems.forEach(item => {
            item.style.display = 'none';
        });

        serverCountElement.textContent = 'Servers (0)';

        let delay = 50;
        serverItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.display = '';
                serverCountElement.textContent = `Servers (${index + 1})`;

                if (index === serverItems.length - 1) {
                    setTimeout(() => {
                        refreshBtn.disabled = false;
                    }, 100);
                }
            }, delay * (index + 1));
        });
    });

    // Dialog closing is natively handled by <form method="dialog"> and global .close handler

    return dialog;
}

document.addEventListener('DOMContentLoaded', function () {
    const newGame = initNewGameDialog();
    const optionsDialog = initOptionsDialog();
    const quitDialog = initQuitDialog();
    const serversDialog = initServersDialog();

    const introOverlay = document.getElementById('intro-overlay');
    introOverlay.addEventListener('transitionend', () => {
        introOverlay.style.display = 'none';
    }, { once: true });

    const menuClickSound = new Audio('sounds/menu_click.wav');
    const menuCloseSound = new Audio('sounds/window_close.wav');

    const backdrop = document.getElementById('dialog-backdrop');

    function openDialog(dialog) {
        if (!dialog) return;
        [newGame, optionsDialog, quitDialog, serversDialog].forEach(d => {
            if (d && d !== dialog && d.open) {
                d.close();
            }
        });
        dialog.show();
        if (backdrop) backdrop.classList.remove('hidden');
    }

    [newGame, optionsDialog, quitDialog, serversDialog].forEach(dialog => {
        if (dialog) {
            dialog.addEventListener('close', () => {
                const anyOpen = [newGame, optionsDialog, quitDialog, serversDialog].some(d => d && d.open);
                if (!anyOpen && backdrop) {
                    backdrop.classList.add('hidden');
                }
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openD = [newGame, optionsDialog, quitDialog, serversDialog].find(d => d && d.open);
            if (openD) {
                openD.close();
                menuCloseSound.currentTime = 0;
                menuCloseSound.play();
            }
        }
    });

    setTimeout(() => {
        introOverlay.classList.add('hidden');
        if (!document.getElementById('game-overlay')) openDialog(newGame); // game.js may already be running
    }, 5100);

    document.querySelectorAll('.cs-dialog .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            menuCloseSound.currentTime = 0;
            menuCloseSound.play();
        });
    });

    const buildLinks = document.querySelectorAll('.build-smth-link');
    buildLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            if (optionsDialog && optionsDialog.open) {
                optionsDialog.close();
            }

            if (serversDialog) {
                openDialog(serversDialog);
            }
        });
    });

    // ─── MENU ITEMS ──────────────────────────────────────────────────────────
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            menuClickSound.currentTime = 0;
            menuClickSound.play();

            const sectionId = this.getAttribute('data-section');

            switch (sectionId) {
                case 'new-game':
                    if (newGame) openDialog(newGame);
                    break;
                case 'options':
                    if (optionsDialog) openDialog(optionsDialog);
                    break;
                case 'find-servers':
                    if (serversDialog) openDialog(serversDialog);
                    break;
                case 'quit':
                    if (quitDialog) openDialog(quitDialog);
                    break;
                default:
                    break;
            }
        });
    });

    // ── Expose voice command hooks ────────────────────────────────────────────
    // Populated here so the voice module (outside this closure) can call them
    // without needing to restructure the entire script.
    window._voiceCmds = {
        openOptions:   function () { openDialog(optionsDialog); },
        openNewGame:   function () { openDialog(newGame); },
        openServers:   function () { openDialog(serversDialog); },
        openQuit:      function () { openDialog(quitDialog); },
        closeAll:      function () {
            [newGame, optionsDialog, quitDialog, serversDialog].forEach(function (d) {
                if (d && d.open) { d.close(); menuCloseSound.currentTime = 0; menuCloseSound.play(); }
            });
        }
    };
});

// ── Voice Recognition Module ─────────────────────────────────────────────────
// Uses native Web Speech API — no dependencies.
// Commands are dispatched via window._voiceCmds which is set inside DOMContentLoaded.
(function () {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var btn   = document.getElementById('voice-btn');
    var toast = document.getElementById('voice-toast');
    if (!btn || !toast) return;

    if (!SpeechRecognition) {
        btn.classList.add('no-support');
        return;
    }

    var recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    var listening = false;
    var toastTimer = null;

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }

    // Keyword → command map. Checked as substring of transcript (lowercase).
    var COMMANDS = [
        { phrase: 'open options',         fn: 'openOptions' },
        { phrase: 'options',              fn: 'openOptions' },
        { phrase: 'open new game',        fn: 'openNewGame' },
        { phrase: 'new game',             fn: 'openNewGame' },
        { phrase: 'open servers',         fn: 'openServers' },
        { phrase: 'find servers',         fn: 'openServers' },
        { phrase: 'servers',              fn: 'openServers' },
        { phrase: 'quit',                 fn: 'openQuit' },
        { phrase: 'close',               fn: 'closeAll' },
        { phrase: 'escape',              fn: 'closeAll' }
    ];

    function dispatch(transcript) {
        var t = transcript.toLowerCase().trim();
        var cmds = window._voiceCmds;
        if (!cmds) return false;

        for (var i = 0; i < COMMANDS.length; i++) {
            if (t.indexOf(COMMANDS[i].phrase) !== -1) {
                var fn = cmds[COMMANDS[i].fn];
                if (fn) fn();
                showToast('✓ ' + transcript);
                return true;
            }
        }
        showToast('? ' + transcript);
        return false;
    }

    recognition.addEventListener('result', function (e) {
        // Try all alternatives
        for (var i = 0; i < e.results[0].length; i++) {
            if (dispatch(e.results[0][i].transcript)) return;
        }
    });

    recognition.addEventListener('end', function () {
        listening = false;
        btn.classList.remove('listening');
    });

    recognition.addEventListener('error', function (e) {
        listening = false;
        btn.classList.remove('listening');
        if (e.error !== 'no-speech') showToast('⚠ ' + e.error);
    });

    btn.addEventListener('click', function () {
        if (listening) {
            recognition.stop();
        } else {
            listening = true;
            btn.classList.add('listening');
            recognition.start();
        }
    });
}());
