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
    var nodesLayer = document.getElementById('nodes-layer');
    var wiresSVG = document.getElementById('wires-svg');

    var GRID_CELL_SIZE = 40;

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
        var t = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + currentScale + ')';
        viewport.style.transform = t;
        nodesLayer.style.transform = t;
        var cellSize = GRID_CELL_SIZE * currentScale;
        gridCanvas.style.backgroundSize = cellSize + 'px ' + cellSize + 'px';
        gridCanvas.style.backgroundPosition = panX + 'px ' + panY + 'px';
        drawWires();
    }

    // Smoothly animate viewport AND grid to a target state, then run a callback.
    function animateTo(targetScale, targetX, targetY, onDone) {
        var dur = '0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        var t = 'translate(' + targetX + 'px, ' + targetY + 'px) scale(' + targetScale + ')';
        viewport.style.transition = 'transform ' + dur;
        nodesLayer.style.transition = 'transform ' + dur;
        viewport.style.transform = t;
        nodesLayer.style.transform = t;
        gridCanvas.style.transition = 'background-size ' + dur + ', background-position ' + dur;
        var targetCellSize = GRID_CELL_SIZE * targetScale;
        gridCanvas.style.backgroundSize = targetCellSize + 'px ' + targetCellSize + 'px';
        gridCanvas.style.backgroundPosition = targetX + 'px ' + targetY + 'px';
        viewport.addEventListener('transitionend', function handler() {
            viewport.removeEventListener('transitionend', handler);
            viewport.style.transition = '';
            nodesLayer.style.transition = '';
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
        var dur = '1.5s cubic-bezier(0.16, 1, 0.3, 1)';
        viewport.style.transition = 'transform ' + dur;
        nodesLayer.style.transition = 'transform ' + dur;
        gridCanvas.style.transition = 'background-size ' + dur + ', background-position ' + dur;
        applyTransform();
        viewport.addEventListener('transitionend', function handler() {
            viewport.removeEventListener('transitionend', handler);
            viewport.style.transition = '';
            nodesLayer.style.transition = '';
            gridCanvas.style.transition = '';
            flyOutNodes();
        });
    }

    function exitWorkingsMode() {
        isWorkingsMode = false;
        isDragging = false;
        hideNodes();
        document.body.classList.remove('zoomed-out');
        document.body.classList.remove('is-dragging');
        animateTo(1, 0, 0, function () {
            viewport.style.transform = '';
            nodesLayer.style.transform = '';
            currentScale = 1;
            panX = 0;
            panY = 0;
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

    // ─── NODE GRAPH ──────────────────────────────────────────────────────────

    var nodePositions = {};   // world-space top-left of every node
    var childDragOffsets = {};   // offsets of children from hub at drag-start

    // ── Helper: get 4 edge-midpoint ports of a positioned node ───────────────
    function getPorts(pos, w, h) {
        return [
            { x: pos.x + w / 2, y: pos.y, dir: 'top' },
            { x: pos.x + w / 2, y: pos.y + h, dir: 'bottom' },
            { x: pos.x, y: pos.y + h / 2, dir: 'left' },
            { x: pos.x + w, y: pos.y + h / 2, dir: 'right' }
        ];
    }

    // ── Helper: draw one bezier path + two port dots ──────────────────────────
    function drawWire(sx, sy, sdx, tx, ty, tdx, tdy, stroke) {
        var t = Math.max(50, Math.sqrt((tx - sx) * (tx - sx) + (ty - sy) * (ty - sy)) * 0.4);
        var cp1x = sx + sdx * t, cp1y = sy + (sdx === 0 ? (ty > sy ? 1 : -1) * t : 0);
        var cp2x = tx + tdx * t, cp2y = ty + tdy * t;
        var d = 'M' + sx + ' ' + sy + ' C' + cp1x + ' ' + cp1y + ' ' + cp2x + ' ' + cp2y + ' ' + tx + ' ' + ty;

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', '3');
        wiresSVG.appendChild(path);

        var c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c1.setAttribute('cx', sx); c1.setAttribute('cy', sy); c1.setAttribute('r', '5');
        c1.setAttribute('fill', stroke);
        wiresSVG.appendChild(c1);

        var c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c2.setAttribute('cx', tx); c2.setAttribute('cy', ty); c2.setAttribute('r', '4');
        c2.setAttribute('fill', stroke);
        wiresSVG.appendChild(c2);
    }

    // ── Wire tangent direction from a port direction string ───────────────────
    function tangent(dir) {
        if (dir === 'left') return { dx: -1, dy: 0 };
        if (dir === 'right') return { dx: 1, dy: 0 };
        if (dir === 'top') return { dx: 0, dy: -1 };
        return { dx: 0, dy: 1 };   // bottom
    }

    // ── Nearest-port pair between two port arrays ─────────────────────────────
    function nearestPair(aPorts, bPorts) {
        var best = null, min = Infinity;
        aPorts.forEach(function (a) {
            bPorts.forEach(function (b) {
                var dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
                if (d < min) { min = d; best = { a: a, b: b }; }
            });
        });
        return best;
    }

    // ── Main wire draw (called every frame) ───────────────────────────────────
    function drawWires() {
        if (!wiresSVG) return;
        wiresSVG.innerHTML = '';
        var vw = window.innerWidth, vh = window.innerHeight;

        var vPorts = [
            { x: vw / 2, y: 0, dir: 'top' },
            { x: vw / 2, y: vh, dir: 'bottom' },
            { x: 0, y: vh / 2, dir: 'left' },
            { x: vw, y: vh / 2, dir: 'right' }
        ];

        // Level 1 — viewport → hub  (gold)
        nodesLayer.querySelectorAll('.hub-node').forEach(function (hub) {
            var pos = nodePositions[hub.id];
            if (!pos || parseFloat(hub.style.opacity) < 0.05) return;
            var w = hub.offsetWidth || 200, h = hub.offsetHeight || 150;
            var pair = nearestPair(vPorts, getPorts(pos, w, h));
            if (!pair) return;
            var ta = tangent(pair.a.dir), tb = tangent(pair.b.dir);
            drawWire(pair.a.x, pair.a.y, ta.dx, pair.b.x, pair.b.y, tb.dx, tb.dy, 'rgba(196,181,80,0.85)');
        });

        // Level 2 — hub → child  (steel-blue)
        nodesLayer.querySelectorAll('.child-node').forEach(function (child) {
            var cpos = nodePositions[child.id];
            if (!cpos || parseFloat(child.style.opacity) < 0.05) return;
            var parentId = child.getAttribute('data-parent');
            var hub = document.getElementById(parentId);
            if (!hub) return;
            var hpos = nodePositions[hub.id];
            if (!hpos) return;
            var hw = hub.offsetWidth || 200, hh = hub.offsetHeight || 150;
            var cw = child.offsetWidth || 150, ch = child.offsetHeight || 80;
            var pair = nearestPair(getPorts(hpos, hw, hh), getPorts(cpos, cw, ch));
            if (!pair) return;
            var ta = tangent(pair.a.dir), tb = tangent(pair.b.dir);
            drawWire(pair.a.x, pair.a.y, ta.dx, pair.b.x, pair.b.y, tb.dx, tb.dy, 'rgba(100,160,210,0.75)');
        });
    }

    // ── Clone injector ────────────────────────────────────────────────────────
    function injectDialogClone(node) {
        var dialogId = node.getAttribute('data-dialog');
        var part = node.getAttribute('data-part');   // null for hub nodes
        var dialog = document.getElementById(dialogId);
        if (!dialog) return;

        var SCALE = 0.7;

        if (!part) {
            // HUB NODE: full dialog clone
            dialog.style.visibility = 'hidden';
            dialog.show();
            var dw = dialog.offsetWidth || 600;
            var dh = dialog.offsetHeight || 400;
            dialog.close();
            dialog.style.visibility = '';

            var clone = dialog.cloneNode(true);
            clone.removeAttribute('id');
            clone.removeAttribute('open');
            clone.classList.add('node-clone');
            clone.querySelectorAll('button,input,select,a').forEach(function (el) {
                el.style.pointerEvents = 'none';
                el.removeAttribute('id');
            });

            var wrap = document.createElement('div');
            wrap.className = 'node-scale-wrap';
            wrap.style.width = dw + 'px';
            wrap.style.height = dh + 'px';
            wrap.style.transform = 'scale(' + SCALE + ')';
            wrap.appendChild(clone);

            var body = node.querySelector('.node-body');
            body.innerHTML = '';
            body.style.height = Math.round(dh * SCALE) + 'px';
            body.appendChild(wrap);
            node.style.width = Math.round(dw * SCALE) + 'px';
            return;
        }

        // CHILD NODE: extract specific fragment
        var clone = dialog.cloneNode(true);
        clone.removeAttribute('id');
        clone.removeAttribute('open');
        clone.classList.add('node-clone');
        clone.querySelectorAll('button,input,select,a').forEach(function (el) {
            el.style.pointerEvents = 'none';
            el.removeAttribute('id');
        });

        var extract = null;
        if (part === 'map') extract = clone.querySelector('.map-selector');
        else if (part === 'info') extract = clone.querySelector('.description');
        else if (part === 'actions') extract = clone.querySelector('.footer-btns');
        else if (part === 'name') extract = clone.querySelector('.player-name-section');
        else if (part === 'spray') extract = clone.querySelector('.spraypaint-section');
        else if (part === 'bio') extract = clone.querySelector('.symbol-rectangle');
        else if (part === 'details') extract = clone.querySelector('.age-and-city-row');
        else if (part === 'msg') extract = clone.querySelector('.content');
        else if (part === 'live' || part === 'complete' || part === 'wip') {
            var wrap2 = document.createElement('div');
            wrap2.className = 'server-browser';
            var hdr = clone.querySelector('.server-list-header');
            if (hdr) wrap2.appendChild(hdr.cloneNode(true));
            var lst = document.createElement('div');
            lst.className = 'server-list';
            clone.querySelectorAll('.server-item').forEach(function (item) {
                var s = (item.querySelector('.project-status-column') || {}).textContent;
                s = (s || '').trim().toLowerCase();
                if (part === 'live' && s === 'live') lst.appendChild(item.cloneNode(true));
                if (part === 'complete' && s === 'complete') lst.appendChild(item.cloneNode(true));
                if (part === 'wip' && s === 'wip') lst.appendChild(item.cloneNode(true));
            });
            wrap2.appendChild(lst);
            extract = wrap2;
        }

        var container = document.createElement('div');
        container.className = 'node-part-inner';
        if (extract) container.appendChild(extract);
        else container.textContent = part;

        container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;visibility:hidden';
        document.body.appendChild(container);
        var dw2 = Math.max(container.offsetWidth, 60);
        var dh2 = Math.max(container.offsetHeight, 30);
        document.body.removeChild(container);
        container.style.cssText = '';

        var scaleWrap = document.createElement('div');
        scaleWrap.className = 'node-scale-wrap';
        scaleWrap.style.width = dw2 + 'px';
        scaleWrap.style.height = dh2 + 'px';
        scaleWrap.style.transform = 'scale(' + SCALE + ')';
        scaleWrap.appendChild(container);

        var body2 = node.querySelector('.node-body');
        body2.innerHTML = '';
        body2.style.height = Math.round(dh2 * SCALE) + 'px';
        body2.appendChild(scaleWrap);
        node.style.width = Math.round(dw2 * SCALE) + 'px';
    }

    // ── Fly-out ───────────────────────────────────────────────────────────────
    function flyOutNodes() {
        var vw = window.innerWidth, vh = window.innerHeight;

        // Inject clones for all nodes
        nodesLayer.querySelectorAll('.node').forEach(injectDialogClone);

        // Hub target positions
        var hubTargets = {
            'hub-ng': { x: -Math.round(vw * 0.30), y: 40 },
            'hub-opt': { x: vw + 20, y: 40 },
            'hub-quit': { x: -Math.round(vw * 0.15), y: Math.round(vh * 0.44) },
            'hub-srv': { x: Math.round(vw * 0.22), y: vh + 30 }
        };

        // Read hub sizes after injection
        var hubSizes = {};
        nodesLayer.querySelectorAll('.hub-node').forEach(function (hub) {
            hubSizes[hub.id] = { w: hub.offsetWidth || 200, h: hub.offsetHeight || 150 };
        });

        // Compute child positions beyond their parent hub
        var GAP = 18, SEP = 12;
        var childTargets = {};
        var childGroups = {};
        nodesLayer.querySelectorAll('.child-node').forEach(function (child) {
            var pid = child.getAttribute('data-parent');
            if (!childGroups[pid]) childGroups[pid] = [];
            childGroups[pid].push(child);
        });

        Object.keys(hubTargets).forEach(function (hid) {
            var ht = hubTargets[hid];
            var hs = hubSizes[hid] || { w: 200, h: 150 };
            var kids = childGroups[hid] || [];
            var hcx = ht.x + hs.w / 2;
            var hcy = ht.y + hs.h / 2;

            // Direction the hub sits relative to viewport center
            var dir;
            if (hcy > vh * 0.85) dir = 'bottom';
            else if (hcx < vw / 2) dir = 'left';
            else dir = 'right';

            kids.forEach(function (child, i) {
                var cw = child.offsetWidth || 150;
                var ch = child.offsetHeight || 80;
                var cx, cy;
                if (dir === 'left') {
                    cx = ht.x - cw - GAP;
                    cy = ht.y + i * (ch + SEP);
                } else if (dir === 'right') {
                    cx = ht.x + hs.w + GAP;
                    cy = ht.y + i * (ch + SEP);
                } else {
                    cx = ht.x + i * (cw + SEP);
                    cy = ht.y + hs.h + GAP;
                }
                childTargets[child.id] = { x: cx, y: cy };
            });
        });

        var allCenter = { x: vw / 2 - 100, y: vh / 2 - 40 };

        // Start everyone at center, hidden
        nodesLayer.querySelectorAll('.node').forEach(function (node) {
            node.style.transition = 'none';
            node.style.left = allCenter.x + 'px';
            node.style.top = allCenter.y + 'px';
            node.style.opacity = '0';
        });

        // Animate hubs first
        var hubNodes = Array.from(nodesLayer.querySelectorAll('.hub-node'));
        hubNodes.forEach(function (hub, i) {
            var tgt = hubTargets[hub.id] || allCenter;
            setTimeout(function () {
                hub.style.transition = 'left 0.65s cubic-bezier(0.16,1,0.3,1), top 0.65s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease';
                nodePositions[hub.id] = tgt;
                hub.style.left = tgt.x + 'px';
                hub.style.top = tgt.y + 'px';
                hub.style.opacity = '1';
            }, 120 + i * 110);
        });

        // Animate children after hubs land
        var hubDelay = 120 + hubNodes.length * 110 + 650;
        var childNodes = Array.from(nodesLayer.querySelectorAll('.child-node'));
        childNodes.forEach(function (child, i) {
            var pid = child.getAttribute('data-parent');
            var hubTgt = hubTargets[pid] || allCenter;
            var tgt = childTargets[child.id] || hubTgt;

            setTimeout(function () {
                // Snap to hub position first (invisible)
                child.style.transition = 'none';
                child.style.left = hubTgt.x + 'px';
                child.style.top = hubTgt.y + 'px';
                child.style.opacity = '0';
            }, hubDelay - 20);

            setTimeout(function () {
                child.style.transition = 'left 0.55s cubic-bezier(0.16,1,0.3,1), top 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease';
                nodePositions[child.id] = tgt;
                child.style.left = tgt.x + 'px';
                child.style.top = tgt.y + 'px';
                child.style.opacity = '1';
                setTimeout(drawWires, 600);
            }, hubDelay + i * 65);
        });
    }

    function hideNodes() {
        wiresSVG.innerHTML = '';
        nodesLayer.querySelectorAll('.node').forEach(function (node) {
            node.style.transition = 'opacity 0.25s ease';
            node.style.opacity = '0';
        });
    }

    // ── Node drag — hub drags children rigidly ────────────────────────────────
    var draggingNode = null, ndx = 0, ndy = 0, nox = 0, noy = 0;

    nodesLayer.addEventListener('mousedown', function (e) {
        if (!isWorkingsMode || !e.target.closest('.node-bar')) return;
        draggingNode = e.target.closest('.node');
        ndx = e.clientX; ndy = e.clientY;
        var p = nodePositions[draggingNode.id] || { x: 0, y: 0 };
        nox = p.x; noy = p.y;
        draggingNode.style.transition = 'none';
        draggingNode.style.zIndex = '10';

        // Capture initial child positions if dragging a hub
        childDragOffsets = {};
        if (draggingNode.classList.contains('hub-node')) {
            nodesLayer.querySelectorAll('.child-node[data-parent="' + draggingNode.id + '"]').forEach(function (child) {
                var cp = nodePositions[child.id] || { x: 0, y: 0 };
                childDragOffsets[child.id] = { x: cp.x - nox, y: cp.y - noy };
                child.style.transition = 'none';
            });
        }
        e.stopPropagation();
    });

    document.addEventListener('mousemove', function (e) {
        if (!draggingNode) return;
        var wx = nox + (e.clientX - ndx) / currentScale;
        var wy = noy + (e.clientY - ndy) / currentScale;
        nodePositions[draggingNode.id] = { x: wx, y: wy };
        draggingNode.style.left = wx + 'px';
        draggingNode.style.top = wy + 'px';

        // Move children rigidly with hub
        if (draggingNode.classList.contains('hub-node')) {
            nodesLayer.querySelectorAll('.child-node[data-parent="' + draggingNode.id + '"]').forEach(function (child) {
                var off = childDragOffsets[child.id];
                if (!off) return;
                var cx = wx + off.x, cy = wy + off.y;
                nodePositions[child.id] = { x: cx, y: cy };
                child.style.left = cx + 'px';
                child.style.top = cy + 'px';
            });
        }
        drawWires();
    });

    document.addEventListener('mouseup', function () {
        if (draggingNode) { draggingNode.style.zIndex = ''; draggingNode = null; }
    });

    // ── Double-click → open parent dialog ────────────────────────────────────
    nodesLayer.addEventListener('dblclick', function (e) {
        var node = e.target.closest('.node');
        if (!node) return;
        var dialog = document.getElementById(node.getAttribute('data-dialog'));
        if (dialog) openDialog(dialog);
    });
});