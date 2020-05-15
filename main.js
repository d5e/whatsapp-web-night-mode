// ==UserScript==
// @name         Whatsapp Web Night Mode
// @namespace    http://js.dev.hyperco.de
// @version      0.2
// @description  Night mode and dark gallery for whatsapp web
//
//               - image gallery gets dark background
//               - adds four cool night modes
//
//               tested on Chrome 81 with tampermonkey 4.10 on OS X 10.14
//
// @author       Henry Stenzel
// @match        https://web.whatsapp.com/
// @require      https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==


const BlendModes = {
    Absorptive: {
        mono: false,
        invert: false,
    },
    Monochrome: {
        mono: true,
        invert: false,
    },
    Night: {
        mono: true,
        invert: true,
    },
};

const { Absorptive, Monochrome, Night } = BlendModes;

const MODES = [
    {
        name: "Warm White",
        color: "rgb(255, 224, 177)",
        mode: Absorptive,
    },
    {
        name: "Amber",
        color: "rgb(146,120,80)",
        mode: Absorptive,
    },
    {
        name: "Sodium",
        color: "rgb(160,100,0)",
        mode: Monochrome,
    },
    {
        name: "Barium",
        color: "rgb(15,189,40)",
        mode: Night,
    },
    {
        name: "Xenon",
        color: "rgb(0,148,185)",
        mode: Night,
    },
];

const CONFIG = {
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

const addNightModeUICSS = () => GM_addStyle(`
body li.wdg-menu-entry {
  opacity: 1.0!important;
  transition: 0.2s background, 0.1s color;
}
body li.wdg-menu-entry > div {
  opacity: 0.9!important;
}
.wdg-menu-entry:hover {
  background: #f5f5f5;
}what
body li.wdg-menu-entry:hover > div {
}
`);

const nightModeStylesColors = () => MODES.map(
    (it, n) => it.color && `
    body.nightModeEnabled.m${1+n} #hard_expire_time {
        background: ${it.color};
    }
`);

const nightModeStylesInversion = () => MODES.map(
    (it, n) => it.mode?.invert && `
    body.nightModeEnabled.m${1+n} #app .emojik,
    body.nightModeEnabled.m${1+n} #app img,
    body.nightModeEnabled.m${1+n} #app {
        filter: invert();
    }
`);

const nightModeStylesSaturation = () => MODES.map(
    (it, n) => it.mode?.mono && `
    body.nightModeEnabled.m${1+n} #app > div {
        filter: saturate(0);
    }
`);

const generatedStyles = () =>
    [
        nightModeStylesColors(),
        nightModeStylesInversion(),
        nightModeStylesSaturation(),
    ].flat().filter((it) => it).join("\n")
;


console.log("nightModeStylesColors", generatedStyles());

const addNightModesCSS = () => GM_addStyle(`
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
${generatedStyles()}
`);

const engageNightMode = () => {
    !window.___injectedNightModeCSS && addNightModesCSS();
    window.___injectedNightModeCSS = true;
    window.___activeNightModeNumber = ((window.___activeNightModeNumber || 0) + 1) % (1 + MODES.length);
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

const debug = (...params) =>
    console.debug(`%c${params.shift()}`, CONFIG.BariumConsole, ...params) || true
;

const findMenuButtonInDom = () =>
    log("addMenuEntry::analyzing DOM", CONFIG.BariumConsole)
    && window.$(`div[role="button"][title="Menu"]`)
;

const addToDropdownMenu = (menu) =>
    menu.find("ul").prepend(newMenuEntry()) &&
    debug("addMenuEntry::injected into DOM ––– done.", CONFIG.BariumConsole) &&
    turnMeOnSafely(menu, 'click', 'ul .wdg-menu-entry', engageNightMode)
;

const menuInjector = () => {
    const menu = findMenuButtonInDom()?.first()?.next();
    return menu?.children()?.length > 0 ?
        {add: (func, ...params) => func && func(menu, ...params)}
        : {add: () => debug(`Whatsapp web menu injector:: menu not found. Not injecting.`)}
};

const safelyAddToDropDownMenu = (menu) =>
    menu && debug("whatsapp-web-night-mode::analyzing DOM:: Menu found", CONFIG.BariumConsole)
    && (menu.find("ul .wdg-menu-entry").length === 0)
    && addToDropdownMenu(menu)
;
const analyzeDom = () =>
    menuInjector().add(safelyAddToDropDownMenu)
;


const WhatsAppNightMode = {
    engage: (launcher) =>
        launcher.addEventListener("click", analyzeDom)
        || addGalleryCSS()
        && log("engaging whatsapp dark gallery", CONFIG.AmberConsole)
        && addNightModeUICSS()
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
