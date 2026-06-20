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
                    document.body.classList.toggle('zoomed-out');
                    break;
                default:
                    break;
            }
        });
    });
});