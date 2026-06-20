function initOptionsDialog() {
    const dialog = document.getElementById('options-dialog');
    if (!dialog) return null;

    const spraypaintImages = {
        'lambda': 'images/me1.jpg',
        'smiley': 'images/me2.jpg',
        'heart': 'images/me3.jpg',
        'kid': 'images/me4.jpg',
    };

    const spraypaintPreview = dialog.querySelector('#spraypaint-preview');
    const spraypaintImageSelector = dialog.querySelector('#spraypaint-image');
    const spraypaintFilterSelector = dialog.querySelector('#spraypaint-filter');

    function updateSpraypaintPreview() {
        const selectedImagePath = spraypaintImages[spraypaintImageSelector.value];
        const selectedFilter = spraypaintFilterSelector.value;

        spraypaintPreview.classList.remove('filter-orange', 'filter-yellow', 'filter-green', 'filter-ltblue');

        if (selectedImagePath) {
            spraypaintPreview.style.backgroundImage = `url('${selectedImagePath}')`;
        }

        if (selectedFilter && selectedFilter !== 'none') {
            spraypaintPreview.classList.add(`filter-${selectedFilter}`);
        }
    }

    updateSpraypaintPreview();

    spraypaintImageSelector.addEventListener('change', updateSpraypaintPreview);
    spraypaintFilterSelector.addEventListener('change', updateSpraypaintPreview);

    const chickenSound = new Audio('sounds/chicken.wav');
    spraypaintPreview.addEventListener('click', function () {
        chickenSound.currentTime = 0;
        chickenSound.play();
    })

    dialog.querySelector('#options-ok').addEventListener('click', function () {
        dialog.close();
    });

    dialog.querySelector('#options-cancel').addEventListener('click', function () {
        dialog.close();
    });

    dialog.querySelector('.close').addEventListener('click', function () {
        dialog.close();
    });

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

    dialog.querySelector('#new-game-cancel').addEventListener('click', function () {
        dialog.close();
    });

    dialog.querySelector('.close').addEventListener('click', function () {
        dialog.close();
    });

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

    dialog.querySelector('.close').addEventListener('click', function () {
        dialog.close();
    });

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
        openDialog(newGame);
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

    // ─── PAN / ZOOM SYSTEM ───────────────────────────────────────────────────

    var viewport = document.getElementById('app-viewport');
    var gridCanvas = document.getElementById('grid-canvas');

    var GRID_CELL_SIZE = 40; // must match the 40px in CSS

    // How zoomed-out the screen starts when entering workings mode.
    // 0.58 means the portfolio appears at 58% of its normal size.
    var INITIAL_SCALE = 0.58;

    var isWorkingsMode = false; // are we in pan/zoom mode?
    var currentScale = 1;      // current zoom level (1 = full size)
    var panX = 0;              // how many pixels the screen has been moved left/right
    var panY = 0;              // how many pixels the screen has been moved up/down

    var isDragging = false;
    var lastMouseX = 0;
    var lastMouseY = 0;

    // Writes the current pan + scale to the viewport AND grid.
    function applyTransform() {
        viewport.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + currentScale + ')';
        // Shift the grid so it feels glued to the floating portfolio.
        // background-position pans the grid lines, background-size scales the cell size.
        var cellSize = GRID_CELL_SIZE * currentScale;
        gridCanvas.style.backgroundSize = cellSize + 'px ' + cellSize + 'px';
        gridCanvas.style.backgroundPosition = panX + 'px ' + panY + 'px';
    }

    // Smoothly animate viewport AND grid to a target state, then run a callback.
    function animateTo(targetScale, targetX, targetY, onDone) {
        var dur = '0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        viewport.style.transition = 'transform ' + dur;
        viewport.style.transform = 'translate(' + targetX + 'px, ' + targetY + 'px) scale(' + targetScale + ')';
        // Animate grid in sync
        gridCanvas.style.transition = 'background-size ' + dur + ', background-position ' + dur;
        var targetCellSize = GRID_CELL_SIZE * targetScale;
        gridCanvas.style.backgroundSize = targetCellSize + 'px ' + targetCellSize + 'px';
        gridCanvas.style.backgroundPosition = targetX + 'px ' + targetY + 'px';
        viewport.addEventListener('transitionend', function handler() {
            viewport.removeEventListener('transitionend', handler);
            viewport.style.transition = '';
            gridCanvas.style.transition = '';
            if (onDone) onDone();
        });
    }

    function enterWorkingsMode() {
        isWorkingsMode = true;
        currentScale = INITIAL_SCALE;
        panX = 0;
        panY = 0;
        document.body.classList.add('zoomed-out');
        // Animate both viewport and grid for the zoom-out entry
        var dur = '1.5s cubic-bezier(0.16, 1, 0.3, 1)';
        viewport.style.transition = 'transform ' + dur;
        gridCanvas.style.transition = 'background-size ' + dur + ', background-position ' + dur;
        applyTransform();
        viewport.addEventListener('transitionend', function handler() {
            viewport.removeEventListener('transitionend', handler);
            viewport.style.transition = '';
            gridCanvas.style.transition = '';
        });
    }

    function exitWorkingsMode() {
        isWorkingsMode = false;
        isDragging = false;
        document.body.classList.remove('zoomed-out');
        document.body.classList.remove('is-dragging');
        animateTo(1, 0, 0, function () {
            viewport.style.transform = '';
            currentScale = 1;
            panX = 0;
            panY = 0;
            // Reset grid back to its default CSS state
            gridCanvas.style.backgroundSize = GRID_CELL_SIZE + 'px ' + GRID_CELL_SIZE + 'px';
            gridCanvas.style.backgroundPosition = '0 0';
        });
    }

    // ── Scroll wheel zoom ────────────────────────────────────────────────────
    // Zoom toward wherever the mouse cursor is sitting.
    viewport.addEventListener('wheel', function (e) {
        if (!isWorkingsMode) return;
        e.preventDefault();

        // Zoom out on scroll-down, zoom in on scroll-up
        var factor = e.deltaY > 0 ? 0.92 : 1.08;
        var newScale = currentScale * factor;

        // Cap: can never zoom in past the initial zoomed-out scale
        if (newScale > INITIAL_SCALE) newScale = INITIAL_SCALE;

        // Zoom toward the cursor position.
        // mouseX/Y are measured from the screen center (where the viewport is anchored).
        var mouseX = e.clientX - window.innerWidth / 2;
        var mouseY = e.clientY - window.innerHeight / 2;

        // Find which point in the viewport content is currently under the cursor
        var contentX = (mouseX - panX) / currentScale;
        var contentY = (mouseY - panY) / currentScale;

        // After the scale changes, shift pan so that same content point stays under cursor
        panX = mouseX - contentX * newScale;
        panY = mouseY - contentY * newScale;
        currentScale = newScale;

        viewport.style.transition = 'none'; // immediate — no lag on scroll
        applyTransform();
    }, { passive: false });

    // ── Drag to pan (left-click or middle-click hold) ────────────────────────
    document.addEventListener('mousedown', function (e) {
        if (!isWorkingsMode) return;
        var isLeftClick = e.button === 0;
        var isMiddleClick = e.button === 1;
        if (!isLeftClick && !isMiddleClick) return;

        // Don't start a drag if the user clicked on a dialog or the backdrop
        if (e.target.closest('.cs-dialog') || e.target === backdrop) return;

        if (isMiddleClick) e.preventDefault(); // stops the browser scroll cursor appearing

        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        document.body.classList.add('is-dragging');
        viewport.style.transition = 'none'; // instant response during drag
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        panX += e.clientX - lastMouseX;
        panY += e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        applyTransform();
    });

    document.addEventListener('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;
        document.body.classList.remove('is-dragging');
    });

    // ── Double-click on viewport to exit workings mode ───────────────────────
    viewport.addEventListener('dblclick', function (e) {
        if (!isWorkingsMode) return;
        // Don't exit if the user double-clicked a server item or dialog
        if (e.target.closest('.cs-dialog') || e.target.closest('.server-item')) return;
        exitWorkingsMode();
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
                case 'workings':
                    if (isWorkingsMode) {
                        exitWorkingsMode();
                    } else {
                        enterWorkingsMode();
                    }
                    break;
                default:
                    break;
            }
        });
    });
});