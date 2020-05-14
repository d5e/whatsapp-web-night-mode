// ==UserScript==
// @name         whatsapp dark gallery
// @namespace    http://js.dev.hyperco.de
// @version      0.2
// @description  Dark Mode for whatsapp aweb
//
//               - image gallery gets dark background
//               - adds four cool night modes
//               - adds menu entry to control night modes
//
//               tested on Chrome 81 with tampermonkey 4.10 on OS X 10.14
//
// @author       Henry Stenzel
// @match        https://web.whatsapp.com/
// @require      https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

const CONFIG = {
    AvailableModesCount: (1 + 4),
    BariumConsole: "color:#222;background:#070; padding:1px 3px 1px 4px;",
    AmberConsole: "color:#251509;background: rgba(146,120,80); padding:1px 3px 1px 4px;",
};

const addGalleryCSS = () => GM_addStyle(`
    [data-animate-media-viewer="true"] {
        background: #222!important;
    }
    [data-animate-media-viewer="true"] > div:first-child *,
    [data-animate-media-viewer="true"] > div:first-child {
        background: #999!important;
    }
    [data-animate-media-viewer="true"] > div:nth-child(2) > div[role="button"]:not(:hover) {
        opacity: 0.2 !important;
    }
`);

const nightModeUICSS = () => GM_addStyle(`
body li.wdg-menu-entry {
  opacity: 1.0!important;
  transition: 0.2s background, 0.1s color;
}
body li.wdg-menu-entry > div {
  opacity: 0.9!important;
}
.wdg-menu-entry:hover {
  background: #f5f5f5;
}
body li.wdg-menu-entry:hover > div {
}
`);

const injectNightModeCSS = () => GM_addStyle(`
body.nightModeEnabled {
  transition: 0.2s filter;
}

body #hard_expire_time {
  transition: 0.2s background-color, 0.2s mix-blend-mode;
}
body.nightModeEnabled #hard_expire_time {
position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: block;
    z-index: 10000;
    pointer-events: none;
    mix-blend-mode: multiply;
}
/* Amber */
body.nightModeEnabled.m1 #hard_expire_time {
  background: rgb(146,120,80);
}

body.nightModeEnabled.m2 #app,
body.nightModeEnabled.m4 #app > div {
  filter: saturate(0);
}
body.nightModeEnabled.m3 #app,
body.nightModeEnabled.m4 #app {
  filter: invert();
}
/* Xenon */
body.nightModeEnabled.m4 #hard_expire_time {
 background: rgb(0,148,185);
}
/* Sodium */
body.nightModeEnabled.m2 #hard_expire_time {
 background: rgb(160,100,0);
}
/* Barium */
body.nightModeEnabled.m3 #hard_expire_time {
 background: rgb(15,189,40);
}
`);

const engageNightMode = () => {
    !window.___injectedNightModeCSS && injectNightModeCSS();
    window.___injectedNightModeCSS = true;
    window.___activeNightModeNumber = ((window.___activeNightModeNumber || 0) + 1) % CONFIG.AvailableModesCount;
    $("body").attr("class", `nightModeEnabled m${window.___activeNightModeNumber}`);

};

const newMenuEntry = () => `
<li tabindex="-1" class="_3L0q3 _167q _36Zz0 wdg-menu-entry"
 data-animate-dropdown-item="true">
    <div class="Pm0Ov _34D8D" role="button" title="New group">
      Night Mode ☾
    </div>
</li>
`;


const turnMeOnSafely = (menu, ...props) =>
    menu.off(...props) && menu.on(...props)
;

const log = (...params) =>
    console.log(`%c${params.shift()}`, ...params) || true
;


const findMenuButtonInDom = () => {
    log("addMenuEntry::analyzing DOM", CONFIG.BariumConsole);
    const menuButton = window.$(`div[role="button"][title="Menu"]`);
    log("addMenuEntry::analyzing DOM:: Button found", CONFIG.BariumConsole, menuButton);
    return menuButton;
};

const addToDropdownMenu = (menu) =>
    menu.find("ul").prepend(newMenuEntry()) &&
    log("addMenuEntry::injected into DOM ––– done.", CONFIG.BariumConsole) &&
    turnMeOnSafely(menu, 'click', 'ul .wdg-menu-entry', engageNightMode)
;

const menuInjector = () => {
    const menu = findMenuButtonInDom().first().next();
    return menu.children().length === 0 ?
        () => 2 : {add: (func, ...params) => func && func(menu, ...params)}
};


const analyzeDom = () =>
    menuInjector().add(
        (menu) =>
            menu && log("addMenuEntry::analyzing DOM:: Menu found", CONFIG.BariumConsole)
        && (menu.find("ul .wdg-menu-entry").length === 0)
        && addToDropdownMenu(menu)
    )
;


const WhatsAppNightMode = {
    engage: (launcher) =>
        launcher.addEventListener("click", analyzeDom)
        || addGalleryCSS()
        && log("engaging whatsapp dark gallery", CONFIG.AmberConsole)
        && nightModeUICSS()
        && log("injected night mode UI styles",CONFIG.BariumConsole)
};




/****************************
 *
 *  start main routine
 *
 *
 *
 */

WhatsAppNightMode.engage(document);
