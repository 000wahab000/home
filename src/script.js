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

// ── Calendar grid renderer ─────────────────────────────────────────────────────────
// contributions: [{ date:'YYYY-MM-DD', count:N, level:0-4 }]
// scheme: 'gh' (gold tones) | 'lc' (steel-blue tones)
function renderCalendarGrid(contributions, scheme) {
    var grid = document.createElement('div');
    grid.className = 'contrib-grid';

    var days = contributions.slice(-7 * 26); // last 26 weeks

    // Pad so column 0 starts on Sunday
    var firstDate = new Date(days[0].date + 'T00:00:00');
    var padded = [];
    for (var p = 0; p < firstDate.getDay(); p++) padded.push(null);
    padded = padded.concat(days);

    for (var j = 0; j < padded.length; j += 7) {
        var week = padded.slice(j, j + 7);
        var col = document.createElement('div');
        col.className = 'contrib-week';
        week.forEach(function (day) {
            var cell = document.createElement('div');
            cell.className = 'contrib-day ' + scheme + '-level-' + (day ? day.level : 0);
            if (day && day.count > 0) cell.title = day.date + ': ' + day.count;
            col.appendChild(cell);
        });
        grid.appendChild(col);
    }
    return grid;
}

// ── LeetCode SVG donut chart ───────────────────────────────────────────────────
function buildDonutSVG(easy, med, hard) {
    var total = (easy + med + hard) || 1;
    var s = 88, cx = s / 2, cy = s / 2, r = 33, sw = 10;
    var circ = 2 * Math.PI * r;
    function arc(frac, color, offset) {
        var dash = (frac * circ).toFixed(2) + ' ' + circ.toFixed(2);
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r +
            '" fill="none" stroke="' + color + '" stroke-width="' + sw +
            '" stroke-dasharray="' + dash +
            '" stroke-dashoffset="' + (-offset).toFixed(2) +
            '" transform="rotate(-90 ' + cx + ' ' + cy + ')" />';
    }
    var eP = easy / total, mP = med / total, hP = hard / total;
    return '<svg width="' + s + '" height="' + s +
        '" viewBox="0 0 ' + s + ' ' + s + '" class="lc-donut">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r +
        '" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="' + sw + '"/>' +
        arc(eP, '#7ecb6e', 0) +
        arc(mP, 'rgba(196,181,80,0.9)', eP * circ) +
        arc(hP, 'rgba(220,80,80,0.85)', (eP + mP) * circ) +
        '<text x="' + cx + '" y="' + (cy + 1) +
        '" text-anchor="middle" dominant-baseline="middle"' +
        ' fill="#c0bfa0" font-size="13" font-weight="bold">' + (easy + med + hard) + '</text>' +
        '<text x="' + cx + '" y="' + (cy + 15) +
        '" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="8">solved</text>' +
        '</svg>';
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
    // Attached to document so it fires over the grid canvas and node panels too.
    document.addEventListener('wheel', function (e) {
        if (!isWorkingsMode) return;
        e.preventDefault();

        // Zoom out on scroll-down, zoom in on scroll-up
        var factor = e.deltaY > 0 ? 0.92 : 1.08;
        var newScale = currentScale * factor;

        // Cap: zoom-out floor is arbitrary small, zoom-in ceiling is 1.5 (150% — lets you inspect nodes up close)
        if (newScale > 1.5) newScale = 1.5;

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

    // ── Bezier wire: smooth cubic curve + port dots ───────────────────────────
    // sdir / tdir: 'left' | 'right' | 'top' | 'bottom'
    function drawWire(sx, sy, sdir, tx, ty, tdir, stroke) {
        // Convert port direction to unit tangent vector
        var sdx = sdir === 'right' ? 1 : sdir === 'left' ? -1 : 0;
        var sdy = sdir === 'bottom' ? 1 : sdir === 'top' ? -1 : 0;
        var tdx = tdir === 'right' ? 1 : tdir === 'left' ? -1 : 0;
        var tdy = tdir === 'bottom' ? 1 : tdir === 'top' ? -1 : 0;

        var dist = Math.sqrt((tx - sx) * (tx - sx) + (ty - sy) * (ty - sy));
        var t = Math.max(50, dist * 0.4);

        var cp1x = sx + sdx * t;
        var cp1y = sy + (sdx === 0 ? (ty > sy ? 1 : -1) * t : 0);
        var cp2x = tx + tdx * t;
        var cp2y = ty + tdy * t;

        var d = 'M' + sx + ' ' + sy +
            ' C' + cp1x + ' ' + cp1y +
            ' ' + cp2x + ' ' + cp2y +
            ' ' + tx + ' ' + ty;

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
            drawWire(pair.a.x, pair.a.y, pair.a.dir, pair.b.x, pair.b.y, pair.b.dir, 'rgba(196,181,80,0.85)');
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
            drawWire(pair.a.x, pair.a.y, pair.a.dir, pair.b.x, pair.b.y, pair.b.dir, 'rgba(100,160,210,0.75)');
        });
    }
    // ── Social preview card injector ───────────────────────────────────────────────
    // GitHub: live calendar + top repos.  LeetCode: SVG donut + calendar.
    // LinkedIn: screenshot image with text fallback.
    var SOCIAL_URLS = {
        'gh-preview': 'https://github.com/000wahab000',
        'lc-preview': 'https://leetcode.com/u/wahab_shaikjh/',
        'li-preview': 'https://www.linkedin.com/in/wahabshafishaikh/'
    };

    function injectSocialPreview(node, part) {
        var body = node.querySelector('.node-body');
        body.innerHTML = '';
        var card = document.createElement('div');
        card.className = 'social-preview-card social-preview-card--' + part.replace('-preview', '');

        // ── GitHub ────────────────────────────────────────────────────
        if (part === 'gh-preview') {
            card.innerHTML = '<div class="spc-loading">⏳ Loading GitHub…</div>';
            body.appendChild(card);
            node.style.width = '360px';
            body.style.minHeight = '120px';

            Promise.all([
                fetch('https://api.github.com/users/000wahab000').then(function (r) { return r.json(); }),
                fetch('https://github-contributions-api.jogruber.de/v4/000wahab000?y=last')
                    .then(function (r) { return r.json(); }).catch(function () { return null; }),
                fetch('https://api.github.com/users/000wahab000/repos?sort=stars&per_page=4')
                    .then(function (r) { return r.json(); }).catch(function () { return []; })
            ]).then(function (results) {
                var profile = results[0], contribData = results[1], repos = results[2];

                card.innerHTML =
                    '<div class="spc-header">' +
                    '<img class="spc-avatar" src="' + profile.avatar_url + '" alt="avatar">' +
                    '<div class="spc-info">' +
                    '<div class="spc-name">' + (profile.name || profile.login) + '</div>' +
                    '<div class="spc-handle">@' + profile.login + '</div>' +
                    (profile.bio ? '<div class="spc-bio-inline">' + profile.bio + '</div>' : '') +
                    '</div>' +
                    '</div>' +
                    '<div class="spc-stats">' +
                    '<span class="spc-stat"><b>' + profile.followers + '</b> followers</span>' +
                    '<span class="spc-stat"><b>' + profile.following + '</b> following</span>' +
                    '<span class="spc-stat"><b>' + profile.public_repos + '</b> repos</span>' +
                    '</div>';

                if (contribData && contribData.contributions) {
                    var totalC = contribData.contributions.reduce(function (s, d) { return s + d.count; }, 0);
                    var calLabel = document.createElement('div');
                    calLabel.className = 'spc-section-label';
                    calLabel.textContent = totalC + ' contributions in the last year';
                    card.appendChild(calLabel);
                    card.appendChild(renderCalendarGrid(contribData.contributions, 'gh'));
                }

                if (repos && repos.length) {
                    var repoLabel = document.createElement('div');
                    repoLabel.className = 'spc-section-label';
                    repoLabel.textContent = 'Top repositories';
                    card.appendChild(repoLabel);
                    var repoGrid = document.createElement('div');
                    repoGrid.className = 'spc-repos-grid';
                    repos.forEach(function (repo) {
                        var item = document.createElement('div');
                        item.className = 'spc-repo-item';
                        item.innerHTML =
                            '<div class="spc-repo-name">' + repo.name + '</div>' +
                            '<div class="spc-repo-meta">' +
                            (repo.language ? '<span class="spc-repo-lang">' + repo.language + '</span>' : '') +
                            '<span class="spc-repo-stars">★ ' + (repo.stargazers_count || 0) + '</span>' +
                            '</div>';
                        repoGrid.appendChild(item);
                    });
                    card.appendChild(repoGrid);
                }

                body.style.minHeight = '';
            }).catch(function () {
                card.innerHTML = '<div class="spc-error">GitHub unreachable</div>';
            });

            // ── LeetCode ─────────────────────────────────────────────────
        } else if (part === 'lc-preview') {
            card.innerHTML = '<div class="spc-loading">⏳ Loading LeetCode…<br><span class="spc-loading-sub">may take ~30s on first load</span></div>';
            body.appendChild(card);
            node.style.width = '330px';
            body.style.minHeight = '120px';

            Promise.all([
                fetch('https://leetcode-api-faisalshohag.vercel.app/wahab_shaikjh').then(function (r) { return r.json(); }),
                fetch('https://alfa-leetcode-api.onrender.com/wahab_shaikjh')
                    .then(function (r) { return r.json(); }).catch(function () { return null; })
            ]).then(function (results) {
                var stats = results[0], alfa = results[1];
                var avatarUrl = alfa && alfa.avatar ? alfa.avatar : '';
                var bio = alfa && alfa.aboutMe ? alfa.aboutMe : '';

                card.innerHTML =
                    '<div class="spc-header">' +
                    (avatarUrl ? '<img class="spc-avatar" src="' + avatarUrl + '" alt="avatar">' : '') +
                    '<div class="spc-info">' +
                    '<div class="spc-name">wahab_shaikjh</div>' +
                    '<div class="spc-handle">Rank #' + (stats.ranking || '—') + '</div>' +
                    (bio ? '<div class="spc-bio-inline">' + bio + '</div>' : '') +
                    '</div>' +
                    '</div>' +
                    '<div class="spc-stats">' +
                    '<span class="spc-stat"><b>' + (stats.totalSolved || 0) + '</b> solved</span>' +
                    '<span class="spc-stat">Rating <b>' + (alfa && alfa.contestRating ? Math.round(alfa.contestRating) : '—') + '</b></span>' +
                    '</div>';

                var donutRow = document.createElement('div');
                donutRow.className = 'spc-lc-donut-row';
                donutRow.innerHTML = buildDonutSVG(stats.easySolved || 0, stats.mediumSolved || 0, stats.hardSolved || 0);
                var breakdown = document.createElement('div');
                breakdown.className = 'spc-lc-breakdown-col';
                breakdown.innerHTML =
                    '<div class="spc-lc-easy">Easy  <b>' + (stats.easySolved || 0) + '</b></div>' +
                    '<div class="spc-lc-med">Med   <b>' + (stats.mediumSolved || 0) + '</b></div>' +
                    '<div class="spc-lc-hard">Hard  <b>' + (stats.hardSolved || 0) + '</b></div>' +
                    '<div class="spc-lc-total-solved"><b>' + (stats.totalSolved || 0) + '</b> total</div>';
                donutRow.appendChild(breakdown);
                card.appendChild(donutRow);

                if (alfa && alfa.submissionCalendar) {
                    var calLabel = document.createElement('div');
                    calLabel.className = 'spc-section-label';
                    calLabel.textContent = 'Submission activity';
                    card.appendChild(calLabel);
                    var calData = typeof alfa.submissionCalendar === 'string'
                        ? JSON.parse(alfa.submissionCalendar) : alfa.submissionCalendar;
                    var contributions = Object.keys(calData).map(function (ts) {
                        var count = calData[ts];
                        var date = new Date(parseInt(ts) * 1000);
                        return {
                            date: date.toISOString().split('T')[0],
                            count: count,
                            level: count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4
                        };
                    }).sort(function (a, b) { return a.date.localeCompare(b.date); });
                    card.appendChild(renderCalendarGrid(contributions, 'lc'));
                }

                body.style.minHeight = '';
            }).catch(function () {
                card.innerHTML = '<div class="spc-error">LeetCode unreachable</div>';
            });

            // ── LinkedIn ────────────────────────────────────────────────
        } else if (part === 'li-preview') {
            var img = document.createElement('img');
            img.className = 'spc-li-img';
            img.src = 'images/linkedin.png';
            img.alt = 'LinkedIn — Wahab Shafi Shaikh';
            img.onerror = function () {
                // Fallback text card if screenshot file is not yet placed
                card.innerHTML =
                    '<div class="spc-li-name">Wahab Shafi Shaikh</div>' +
                    '<div class="spc-li-headline">Upcoming Sophomore at VESIT | ML | AI | Build In Public</div>' +
                    '<div class="spc-li-sub">264 connections · Mumbai, India</div>' +
                    '<div class="spc-li-note">Open to opportunities</div>';
            };
            card.appendChild(img);
            body.appendChild(card);
            node.style.width = '320px';
        }
    }

    // ── Project Preview Injector ──────────────────────────────────────────────
    var PROJECT_DATA = {
        'askves': { name: 'AskVES', stack: ['Python', 'Flask', 'Gemini API'], status: 'pending', url: 'https://github.com/000wahab000/AskVes' },
        'tatkal': { name: 'Smart Tatkal', stack: ['FastAPI', 'React', 'Python'], status: 'pending', url: 'https://github.com/000wahab000/SmartTatkal' },
        'studysync': { name: 'StudySync', stack: ['JS', 'Flask', 'Firebase'], status: 'pending', url: 'https://github.com/000wahab000/StudySync' },
        'autopilot': { name: 'Autopilot Planner', stack: ['Python', 'Flask', 'Gemini API'], status: 'pending', url: 'https://github.com/000wahab000/AutoPilotPlanner' },
        'gpt2': { name: 'GPT-2 Fine-Tune', stack: ['Python', 'PyTorch', 'HuggingFace'], status: 'complete', url: 'https://github.com/000wahab000/fine_tuning_gpt_2' },
        'hand': { name: 'Hand Tracking', stack: ['Python', 'OpenCV'], status: 'complete', url: 'https://github.com/000wahab000/AI_Hand_Tracking' },
        'java': { name: 'Java Paint', stack: ['Java', 'Swing'], status: 'complete', url: 'https://github.com/000wahab000/Java-Paint' },
        'stackrx': { name: 'StackRx', stack: ['React'], status: 'wip', url: 'https://github.com/000wahab000/StackRx' }
    };

    // ── Spotify Album data — add `id` once you have the Spotify album URL ────
    var SPOTIFY_ALBUMS = {
        'luvsic':      { name: 'Luv(sic) Hexalogy',    artist: 'Nujabes',             id: '6dVIqQ8qmQ5GBnJ9shOYGE' },
        'gnx':         { name: 'GNX',                   artist: 'Kendrick Lamar',      id: '1I9TAJhnJucoNfu2KX8Hcg' },
        'chromakopia': { name: 'Chromakopia',            artist: 'Tyler, the Creator',  id: '4NRsGHlWBTl4rdLcq8CKcH' },
        'bully':       { name: 'BULLY',                  artist: 'Kanye West',          id: '4SZko61aMnmgvNhfhgTuD3' },
        'graduation':  { name: 'Graduation',             artist: 'Kanye West',          id: '1cN1GECqXrHlPhLX7LGg3e' },
        'okcomputer':  { name: 'OK Computer',            artist: 'Radiohead',           id: '5vkqYmiPBYLaalcmjujWxK' },
        'inrainbows':  { name: 'In Rainbows',            artist: 'Radiohead',           id: '1ogfnXsQc3mf2BQAL9e9iJ' },
        'letsstart':   { name: "Let's Start Here.",      artist: 'Lil Yachty',         id: '' },
        'grengjai':    { name: 'The Greng Jai Piece',    artist: 'Phum Viphurit',       id: '33DzKnwuBE6lfOiADwzd5E', embedType: 'track' },
        'snowfall':    { name: 'Snowfall',               artist: '\u00d8neheart',       id: '5poA9SAx0Xiz1cf17fWBLS' },
        'lsd':         { name: 'At.Long.Last.A$AP',      artist: 'A$AP Rocky',          id: '' },
        'mac':         { name: 'Rock & Roll Night Club', artist: 'Mac DeMarco',         id: '0hvT3yIEysuuvkK73vgdcW' },
        'brittle':     { name: 'Brittle Bones Nicky',    artist: 'Rare Americans',      id: '' },
        'mystery':     { name: '???',                    artist: '???',                 id: '0U28P0QVB1QRxpqp5IHOlH' },
        'tootime':     { name: 'TOOTIMETOOTIMETOOTIME',  artist: 'The 1975',            id: '' }
    };

    function injectProjectPreview(node) {
        var projectId = node.getAttribute('data-project');
        var data = PROJECT_DATA[projectId];
        if (!data) return;

        // Add URL to SOCIAL_URLS so dblclick opens GitHub
        SOCIAL_URLS['project-' + projectId] = data.url;
        node.setAttribute('data-part', 'project-' + projectId);

        var body = node.querySelector('.node-body');
        body.innerHTML = '';

        var card = document.createElement('div');
        card.className = 'project-preview-card';

        var statusLabels = { 'pending': 'DEPLOY PENDING', 'complete': 'COMPLETE', 'wip': 'WIP' };
        var stackHtml = data.stack.map(function (s) { return '<span class="ppc-stack-chip">' + s + '</span>'; }).join('');

        card.innerHTML =
            '<div class="ppc-header">' +
            '<div class="ppc-name">' + data.name + '</div>' +
            '<div class="ppc-status ppc-status--' + data.status + '">' + statusLabels[data.status] + '</div>' +
            '</div>' +
            '<div class="ppc-stack">' + stackHtml + '</div>';

        body.appendChild(card);
        node.style.width = '240px';
    }

    // ── Music section header (node-opt-music) ────────────────────────────────
    function injectMusicSection(node) {
        var body = node.querySelector('.node-body');
        var inner = document.createElement('div');
        inner.className = 'node-part-inner';
        inner.innerHTML = '<span style="color:rgba(196,181,80,0.7);font-size:10px;letter-spacing:1px;">&#9835; MUSIC<\/span>';
        body.innerHTML = '';
        body.appendChild(inner);
        node.style.width = '80px';
    }

    // ── Spotify envelope+disc album card ─────────────────────────────────────
    function injectSpotifyCard(node) {
        var key = node.getAttribute('data-album');
        var data = SPOTIFY_ALBUMS[key];
        if (!data) return;

        var body = node.querySelector('.node-body');
        body.innerHTML = '';

        // dblclick → open Spotify album (or search fallback)
        var spotifyUrl = data.id
            ? 'https://open.spotify.com/' + (data.embedType || 'album') + '/' + data.id
            : 'https://open.spotify.com/search/' + encodeURIComponent((data.artist + ' ' + data.name).trim());
        var partKey = 'spotify-' + key;
        SOCIAL_URLS[partKey] = spotifyUrl;
        node.setAttribute('data-part', partKey);

        var card = document.createElement('div');
        card.className = 'spotify-card';

        // Envelope top
        var envTop = document.createElement('div');
        envTop.className = 'spotify-env-top';
        card.appendChild(envTop);

        // Half-visible disc
        var discWrap = document.createElement('div');
        discWrap.className = 'spotify-disc-wrap';
        var disc = document.createElement('div');
        disc.className = 'spotify-disc';
        discWrap.appendChild(disc);
        card.appendChild(discWrap);

        var nameEl = document.createElement('div');
        nameEl.className = 'spotify-name';
        nameEl.textContent = data.name;
        card.appendChild(nameEl);

        var artistEl = document.createElement('div');
        artistEl.className = 'spotify-artist';
        artistEl.textContent = data.artist;
        card.appendChild(artistEl);

        var activePopup = null;

        card.addEventListener('click', function (e) {
            e.stopPropagation();
            if (activePopup) {
                activePopup.remove();
                activePopup = null;
                card.classList.remove('playing');
                node.style.overflow = '';
                body.style.overflow = '';
                return;
            }
            var popup = document.createElement('div');
            popup.className = 'spotify-popup';
            if (data.id) {
                var iframe = document.createElement('iframe');
                iframe.src = 'https://open.spotify.com/embed/' + (data.embedType || 'album') + '/' + data.id + '?utm_source=generator&theme=0';
                iframe.style.cssText = 'width:280px;height:152px;border:none;display:block;';
                iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
                iframe.setAttribute('loading', 'lazy');
                popup.appendChild(iframe);
            } else {
                popup.innerHTML = '<div class="spotify-pending">ID pending — dblclick to search Spotify<\/div>';
            }
            node.style.overflow = 'visible';
            body.style.overflow = 'visible';
            card.appendChild(popup);
            activePopup = popup;
            card.classList.add('playing');
        });

        body.appendChild(card);
        node.style.width = '120px';
    }

    // ── Clone injector ────────────────────────────────────────────────────────
    function injectDialogClone(node) {
        var dialogId = node.getAttribute('data-dialog');
        var part = node.getAttribute('data-part');   // null for hub nodes

        // SPOTIFY MUSIC NODES — no dialog needed
        if (part === 'spotify') {
            injectSpotifyCard(node);
            return;
        }

        var dialog = document.getElementById(dialogId);
        if (!dialog) return;

        var SCALE = 0.7;

        // MUSIC SECTION HEADER — has data-dialog but handled before cloning
        if (part === 'music-section') {
            injectMusicSection(node);
            return;
        }

        // SOCIAL PREVIEW NODES — built from live APIs, not from dialog clones
        if (part === 'gh-preview' || part === 'lc-preview' || part === 'li-preview') {
            injectSocialPreview(node, part);
            return;
        }

        // PROJECT NODES — built from JSON map
        if (part === 'project') {
            injectProjectPreview(node);
            return;
        }

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
            'hub-ng':   { x: -Math.round(vw * 0.45), y: 40 },
            'hub-opt':  { x: vw + 20, y: 40 },
            'hub-quit': { x: -Math.round(vw * 0.15), y: Math.round(vh * 0.65) },
            'hub-srv':  { x: Math.round(vw * 0.22), y: vh + 30 }
        };

        // Read hub sizes after injection
        var hubSizes = {};
        nodesLayer.querySelectorAll('.hub-node').forEach(function (hub) {
            hubSizes[hub.id] = { w: hub.offsetWidth || 200, h: hub.offsetHeight || 150 };
        });

        // Compute child positions: dynamic stacking, min 20px between node edges
        var CHILD_GAP = 20;  // minimum gap between child node edges
        var CHILD_STUB = 30;  // gap between hub edge and the child column/row

        var childTargets = {};

        // Group children by parent hub ID
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

            // Determine which side of the hub children should stack on
            var hcx = ht.x + hs.w / 2;
            var hcy = ht.y + hs.h / 2;

            var dir;
            if (hcy > vh * 0.85) dir = 'bottom';  // hub-srv: row below
            else if (hcx < vw / 2) dir = 'left';    // hub-ng, hub-quit: column to the left
            else dir = 'right';   // hub-opt: column to the right

            // Cursor tracks where the next child starts
            var cursorX = 0, cursorY = 0;

            if (dir === 'left') {
                cursorY = ht.y;                           // align column top with hub top
                kids.forEach(function (child) {
                    var cw = child.offsetWidth || 150;
                    var ch = child.offsetHeight || 80;
                    childTargets[child.id] = {
                        x: ht.x - cw - CHILD_STUB,       // place column to the LEFT of hub
                        y: cursorY
                    };
                    cursorY += ch + CHILD_GAP;            // advance cursor down by node height + gap
                });

            } else if (dir === 'right') {
                cursorY = ht.y;                           // align column top with hub top
                kids.forEach(function (child) {
                    var ch = child.offsetHeight || 80;
                    childTargets[child.id] = {
                        x: ht.x + hs.w + CHILD_STUB,     // place column to the RIGHT of hub
                        y: cursorY
                    };
                    cursorY += ch + CHILD_GAP;
                });

            } else {
                // 'bottom' (hub-srv): center children horizontally under the hub
                // Wrap into multiple rows if there are many children (e.g. max 3 per row)
                var MAX_PER_ROW = 3;
                var SRV_GAP = 60;
                var ROW_GAP = 60;

                var rows = [];
                for (var i = 0; i < kids.length; i += MAX_PER_ROW) {
                    rows.push(kids.slice(i, i + MAX_PER_ROW));
                }

                var currentY = ht.y + hs.h + CHILD_STUB;

                rows.forEach(function (rowKids) {
                    var totalW = 0;
                    rowKids.forEach(function (child) {
                        totalW += (child.offsetWidth || 150);
                    });
                    totalW += SRV_GAP * (rowKids.length - 1);

                    var cursorX = (ht.x + hs.w / 2) - totalW / 2;
                    rowKids.forEach(function (child) {
                        var cw = child.offsetWidth || 150;
                        childTargets[child.id] = { x: cursorX, y: currentY };
                        cursorX += cw + SRV_GAP;
                    });

                    // Assume all items in row are roughly same height, use the first one
                    var rowH = rowKids[0].offsetHeight || 100;
                    currentY += rowH + ROW_GAP;
                });
            }
        });

        // Position grandchildren (children of children, e.g. social nodes)
        // Music album nodes → 4-column grid to the right of the social preview zone.
        // Social nodes (gh/lc/li) → existing horizontal row below their parent.
        Object.keys(childTargets).forEach(function (cid) {
            var grandKids = childGroups[cid];
            if (!grandKids || grandKids.length === 0) return;
            var ct = childTargets[cid];
            var childEl = document.getElementById(cid);
            var ch = childEl ? (childEl.offsetHeight || 100) : 100;
            var cw = childEl ? (childEl.offsetWidth || 80) : 80;

            // ── 4×4 GRID: music album nodes ─────────────────────────────────
            if (cid === 'node-opt-music') {
                var COLS   = 4;
                var GAP_X  = 14;
                var GAP_Y  = 14;
                var CARD_W = 120; // fixed width set in injectSpotifyCard
                // Social preview cards (gh/lc/li ~320px × 3) are centered around ct.x.
                // Their right edge ≈ ct.x + cw/2 + 560. Add 40px buffer.
                var startX = ct.x + cw / 2 + 600;
                var startY = ct.y;
                grandKids.forEach(function (gKid, i) {
                    var col   = i % COLS;
                    var row   = Math.floor(i / COLS);
                    var cardH = gKid.offsetHeight || 110;
                    childTargets[gKid.id] = {
                        x: startX + col * (CARD_W + GAP_X),
                        y: startY + row * (cardH  + GAP_Y)
                    };
                });
                return;
            }

            // ── Default: single horizontal row below the parent ──────────────
            var HORIZ_GAP = 40;
            var totalW = 0;
            grandKids.forEach(function (gk) { totalW += (gk.offsetWidth || 320); });
            totalW += HORIZ_GAP * (grandKids.length - 1);

            var cursorX = ct.x - (totalW / 2) + cw / 2;
            grandKids.forEach(function (gKid) {
                var gkw = gKid.offsetWidth || 320;
                childTargets[gKid.id] = {
                    x: cursorX,
                    y: ct.y + ch + CHILD_STUB
                };
                cursorX += gkw + HORIZ_GAP;
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
            // Find the root hub origin (walk up from parent)
            var hubOrigin = hubTargets[pid];
            if (!hubOrigin) {
                // grandchild — walk up one more level to find the hub
                var parentEl = document.getElementById(pid);
                var grandPid = parentEl ? parentEl.getAttribute('data-parent') : null;
                hubOrigin = grandPid ? (hubTargets[grandPid] || allCenter) : allCenter;
            }
            var tgt = childTargets[child.id] || hubOrigin;

            setTimeout(function () {
                // Snap to hub position first (invisible)
                child.style.transition = 'none';
                child.style.left = hubOrigin.x + 'px';
                child.style.top = hubOrigin.y + 'px';
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

    // ── Node selection — one node at a time, accent colour per hub family ────
    var selectedNode = null;

    // Accent colour for each hub; children inherit their parent hub's colour
    var HUB_COLORS = {
        'hub-ng': '#1a8080',   // dark teal          — Create Server
        'hub-opt': '#993333',   // dark red-teal       — Options
        'hub-quit': '#2d7a40',   // dark green-teal     — Quit / Confirm
        'hub-srv': '#7a6e1a'    // dark yellow-teal    — Servers
    };

    function getNodeAccent(node) {
        var id = node.id;
        if (HUB_COLORS[id]) return HUB_COLORS[id];
        // Walk up the data-parent chain until we find a hub colour
        var currentId = node.getAttribute('data-parent');
        while (currentId) {
            if (HUB_COLORS[currentId]) return HUB_COLORS[currentId];
            var parentEl = document.getElementById(currentId);
            currentId = parentEl ? parentEl.getAttribute('data-parent') : null;
        }
        return '#2db8b8';
    }

    function clearSelection() {
        if (!selectedNode) return;
        selectedNode.classList.remove('node-selected');
        var bar = selectedNode.querySelector('.node-bar');
        if (bar) bar.style.background = '';
        selectedNode = null;
    }

    function selectNode(node) {
        selectedNode = node;
        node.classList.add('node-selected');
        var bar = node.querySelector('.node-bar');
        if (bar) bar.style.background = getNodeAccent(node);
    }

    // ── Node drag — hub drags children rigidly ────────────────────────────────
    var draggingNode = null, ndx = 0, ndy = 0, nox = 0, noy = 0;
    var dragMoved = false;   // distinguishes a real drag from a click

    nodesLayer.addEventListener('mousedown', function (e) {
        if (!isWorkingsMode || !e.target.closest('.node-bar')) return;
        draggingNode = e.target.closest('.node');
        ndx = e.clientX; ndy = e.clientY;
        dragMoved = false;
        var p = nodePositions[draggingNode.id] || { x: 0, y: 0 };
        nox = p.x; noy = p.y;
        draggingNode.style.transition = 'none';
        draggingNode.style.zIndex = selectedNode === draggingNode ? '20' : '10';

        // Capture initial child/grandchild positions if dragging a hub
        childDragOffsets = {};
        if (draggingNode.classList.contains('hub-node')) {
            // Recursively collect all descendants
            function collectDescendants(parentId) {
                nodesLayer.querySelectorAll('.child-node[data-parent="' + parentId + '"]').forEach(function (desc) {
                    var cp = nodePositions[desc.id] || { x: 0, y: 0 };
                    childDragOffsets[desc.id] = { x: cp.x - nox, y: cp.y - noy };
                    desc.style.transition = 'none';
                    collectDescendants(desc.id);
                });
            }
            collectDescendants(draggingNode.id);
        }
        e.stopPropagation();
    });

    document.addEventListener('mousemove', function (e) {
        if (!draggingNode) return;
        // Mark as a real drag if mouse moved more than 5px
        if (!dragMoved && (Math.abs(e.clientX - ndx) > 5 || Math.abs(e.clientY - ndy) > 5)) {
            dragMoved = true;
        }
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
        if (draggingNode) {
            // Restore transform transition after drag ends
            draggingNode.style.transition = '';
            draggingNode.style.zIndex = '';
            draggingNode = null;
        }
    });

    // ── Single-click → select node (only if it wasn't a drag) ────────────────
    nodesLayer.addEventListener('click', function (e) {
        if (!isWorkingsMode) return;
        if (dragMoved) return;           // was a drag, not a click
        var node = e.target.closest('.node');
        if (!node) { clearSelection(); return; }
        if (node === selectedNode) { clearSelection(); return; }  // toggle off
        clearSelection();
        selectNode(node);
    });

    // ── Double-click → open parent dialog (or external URL for social nodes) ──
    nodesLayer.addEventListener('dblclick', function (e) {
        var node = e.target.closest('.node');
        if (!node) return;

        // Social preview nodes navigate to the real profile page
        var part = node.getAttribute('data-part');
        if (SOCIAL_URLS[part]) {
            window.open(SOCIAL_URLS[part], '_blank', 'noopener');
            return;
        }

        var dialog = document.getElementById(node.getAttribute('data-dialog'));
        if (dialog) openDialog(dialog);
    });
});