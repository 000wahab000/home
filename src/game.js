// Real CS 1.6 in the browser: Xash3D-FWGS (WebAssembly) + your own Steam game files.
// Game data is NOT in the repo: put a zip with valve/ and cstrike/ at src/game/cs16.zip (see tools/pack-cs16.ps1).
import { Xash3D } from './engine/xash3d.mjs';
import { unzipSync } from 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/esm/browser.js';

const E = 'engine/';
const GAME_ZIP = 'game/cs16.zip';
const DEFAULT_MAP = 'de_dust2';

let started = false;

async function startGame(mapName) {
    if (started) return;
    started = true;

    const overlay = document.createElement('div');
    overlay.id = 'game-overlay';
    overlay.innerHTML = '<canvas id="game-canvas" tabindex="0"></canvas><div id="game-status">Loading game files...</div>';
    document.body.appendChild(overlay);
    const canvas = overlay.querySelector('canvas');
    const status = overlay.querySelector('#game-status');
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    try {
        const res = await fetch(GAME_ZIP);
        if (!res.ok) throw new Error('Game files not found (' + GAME_ZIP + '). Run tools/pack-cs16.ps1 first.');
        const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
        const map = files['cstrike/maps/' + mapName + '.bsp'] ? mapName : DEFAULT_MAP;

        status.textContent = 'Starting engine...';
        const x = new Xash3D({
            canvas,
            arguments: ['-game', 'cstrike', '-windowed', '+_vgui_menus', '0', '+hud_scale', '2', '+volume', '0.3', '+sv_lan', '1', '-width', String(innerWidth), '-height', String(innerHeight), '+map', map],
            libraries: {
                xash: E + 'xash.wasm',
                filesystem: E + 'filesystem_stdio.wasm',
                menu: E + 'cstrike/cl_dlls/menu_emscripten_wasm32.wasm',
                client: E + 'cstrike/cl_dlls/client_emscripten_wasm32.wasm',
                server: E + 'cstrike/dlls/cs_emscripten_wasm32.wasm',
                render: { gl4es: E + 'libref_webgl2.wasm' },
            },
            filesMap: {
                'dlls/cs_emscripten_wasm32.wasm': E + 'cstrike/dlls/cs_emscripten_wasm32.wasm',
                'dlls/mp_emscripten_wasm32.wasm': E + 'cstrike/dlls/cs_emscripten_wasm32.wasm',
                // the engine dlopens this by absolute path after FS.chdir('/rodir')
                '/rodir/filesystem_stdio.wasm': E + 'filesystem_stdio.wasm',
            },
            dynamicLibraries: ['dlls/cs_emscripten_wasm32.wasm', '/rodir/filesystem_stdio.wasm'],
        });
        await x.init();

        const FS = x.em.FS;
        for (const [path, data] of Object.entries(files)) {
            if (path.endsWith('/')) continue;
            const full = '/rodir/' + path;
            FS.mkdirTree(full.slice(0, full.lastIndexOf('/')));
            FS.writeFile(full, data);
        }
        for (const [name, url] of [['valve/extras.pk3', E + 'extras.pk3'], ['cstrike/extras.pk3', E + 'cstrike/extras.pk3']]) {
            FS.mkdirTree('/rodir/' + name.split('/')[0]);
            FS.writeFile('/rodir/' + name, new Uint8Array(await (await fetch(url)).arrayBuffer()));
        }
        FS.chdir('/rodir');

        status.remove();
        x.main();
        canvas.focus();
    } catch (err) {
        console.error(err);
        status.textContent = err.message + ' (Esc to close)';
        started = false;
        addEventListener('keydown', function close(e) {
            if (e.key !== 'Escape') return;
            removeEventListener('keydown', close);
            overlay.remove();
        });
    }
}

document.getElementById('new-game-start')?.addEventListener('click', () => {
    const sel = document.querySelector('#new-game-dialog .cs-select');
    startGame(sel ? sel.value : DEFAULT_MAP);
});
