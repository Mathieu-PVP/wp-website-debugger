/*
    Website Debugger - Développé par Mathieu Gallais de Chateaucroc © 2024
    Licence : MIT

    Description : Script qui permet de déboguer le front-end d'un site internet.
*/

/* Importation de FontAwesome si il n'est pas déjà importé */
function loadFontAwesome() {
    const isFontAwesomeLoaded = Array.from(document.head.getElementsByTagName('link')).some((link) =>
        link.href.includes('cdnjs.cloudflare.com/ajax/libs/font-awesome')
    );

    if (!isFontAwesomeLoaded) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
        document.head.appendChild(link);
    }
}

/* Injection du style dans le <head> */
function addToastStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        #dgjs-toast-container {
            position: fixed;
            top: 0px;
            right: 0px;
            z-index: 99999;
            display: flex;
            flex-direction: column-reverse;
            align-items: flex-end;
            gap: 20px;
            max-height: 100vh;
            overflow-y: auto;
            background-color: #000000b5;
            padding: 15px;
        }
        .dgjs-toasts {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
            max-height: 100%;
            overflow-y: auto;
            scrollbar-gutter: stable;
            padding-right: 10px;
        }
        .dgjs-toasts::-webkit-scrollbar {
            width: 10px;
        }
        .dgjs-toasts::-webkit-scrollbar-track {
            background-color: #343434;
        }
        .dgjs-toasts::-webkit-scrollbar-thumb {
            background-color: #000000;
            box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
        }
        .dgjs-toast {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            border-radius: 5px;
            color: #fff;
            font-size: 14px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            animation: dgjs-fade-in 0.5s ease;
            position: relative;
            gap: 5px;
            font-family: "Courier Prime", monospace;
            max-width: 45vw;
            word-wrap: break-word;
        }
        .dgjs-fade-out {
            animation: dgjs-fade-out 0.5s ease forwards; 
        }
        @keyframes dgjs-fade-in {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dgjs-fade-out {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
        .dgjs-toast-icon {
            margin-right: 10px;
            font-size: 14px;
            opacity: 0.5;
        }
        .dgjs-close-button {
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.5;
            padding: 8px 1em;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .dgjs-close-button:hover { background-color: #881644; }
        .dgjs-toast.error { background-color: #e74c3c; }
        .dgjs-toast.success { background-color: #2ecc71; }
        .dgjs-toast.info { background-color: #3498db; }
        .dgjs-toast.warning { background-color: #f39c12; }
        #dgjs-toggle-button {
            background-color: #000000;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 100000;
            transition: background-color 0.3s ease;
        }
        #dgjs-toggle-button:hover {
            background-color: #1D1D1D;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Classe des Toasts.
 */
class Toast {
    /**
     * Conteneur des toasts.
     * @type {HTMLElement}
     */
    static toastContainer;

    /**
     * Création de l'instance
     * @param {string} type - Le type de toast (error, warning...)
     * @param {string} message - Le message à afficher
     * @param {boolean} [temporary=false] - Booléen qui sert à savoir si le toast doit s'enlever automatiquement après 5 secondes
     */
    constructor(type, message, temporary = false) {
        this.type = type;
        this.message = message;
        this.temporary = temporary;

        if (!Toast.toastContainer) {
            Toast.createContainer();
        }

        this.renderToast();
    }

    /**
     * Crée le conteneur des toasts
     */
    static createContainer() {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'dgjs-toast-container';

        Toast.toastContainer = document.createElement('div');
        Toast.toastContainer.classList.add('dgjs-toasts');
        toastContainer.appendChild(Toast.toastContainer);

        document.body.appendChild(toastContainer);
        this.createToggleButton();
    }

    /**
     * Crée le bouton pour afficher ou masquer les toasts
     */
    static createToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'dgjs-toggle-button';
        toggleButton.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';

        const isHidden = sessionStorage.getItem('dgjs-toasts-hidden') === 'true';
        const toastContainer = document.querySelector('.dgjs-toasts');
        if (isHidden) {
            toastContainer.style.display = 'none';
            toggleButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
        }

        toggleButton.onclick = function () {
            const toastContainer = document.querySelector('.dgjs-toasts');
            const isCurrentlyHidden = toastContainer.style.display === 'none';

            if (isCurrentlyHidden) {
                toastContainer.style.display = 'flex';
                toggleButton.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
                sessionStorage.setItem('dgjs-toasts-hidden', 'false');
            } else {
                toastContainer.style.display = 'none';
                toggleButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
                sessionStorage.setItem('dgjs-toasts-hidden', 'true');
            }
        };

        const toastContainerDiv = document.querySelector('#dgjs-toast-container');
        toastContainerDiv.appendChild(toggleButton);
    }

    /**
     * Méthode qui génère le rendu du toast dans le conteneur
     */
    renderToast() {
        const toast = document.createElement('div');
        toast.classList.add('dgjs-toast', this.type);
        toast.appendChild(this.createContent());
        toast.appendChild(this.createCloseButton());
        Toast.toastContainer.appendChild(toast);

        if (this.temporary) {
            setTimeout(() => this.removeToast(toast), 5000);
        }
    }

    /**
     * Crée le contenu du toast
     * @returns {HTMLElement} Le toast
     */
    createContent() {
        const content = document.createElement('div');
        content.classList.add('dgjs-toast-content');
        content.appendChild(this.createIcon());

        const messageText = document.createElement('span');
        messageText.textContent = this.message;
        content.appendChild(messageText);

        return content;
    }

    /**
     * Crée l'icône associée au type du toast
     * @returns {HTMLElement} L'icone
     */
    createIcon() {
        const icon = document.createElement('i');
        const iconMap = {
            error: 'fa-solid fa-exclamation-circle',
            info: 'fa-solid fa-info-circle',
            success: 'fa-solid fa-check-circle',
            warning: 'fa-solid fa-exclamation-triangle',
        };
        icon.classList.add(...(iconMap[this.type] || 'fa-solid fa-bell').split(' '));
        icon.classList.add('dgjs-toast-icon');
        return icon;
    }

    /**
     * Crée le bouton de fermeture
     * @returns {HTMLElement} Le bouton de fermeture
     */
    createCloseButton() {
        const closeButton = document.createElement('button');
        closeButton.classList.add('dgjs-close-button');

        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-times');
        closeButton.appendChild(icon);

        closeButton.onclick = () => this.removeToast(closeButton.closest('.dgjs-toast'));
        return closeButton;
    }

    /**
     * Supprime le toast après l'animation de suppression
     * @param {HTMLElement} toast - Le toast à supprimer
     */
    removeToast(toast) {
        toast.classList.add('dgjs-fade-out');
        setTimeout(() => toast.remove(), 500);
    }
}

window.addEventListener('error', (event) => {
    const errorMessage = `${event.message} at ${event.filename}:${event.lineno}`;
    new Toast('error', errorMessage);
});

window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = `Unhandled promise rejection: ${event.reason}`;
    new Toast('error', errorMessage);
});

/* Création d'un émetteur d'événements personnalisés */
const EventEmitter = {
    events: {},
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    },
    emit(event, ...args) {
        this.events[event]?.forEach(listener => listener(...args));
    }
};

/* Si des logs ou des warns apparaissent alors on créé un évènement personnalisé */
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

console.log = function (...args) {
    originalConsoleLog.apply(console, args);
    EventEmitter.emit('log', args.join(' '));
};

console.warn = function (...args) {
    originalConsoleWarn.apply(console, args);
    EventEmitter.emit('warn', args.join(' '));
};

EventEmitter.on('log', (message) => new Toast('info', 'Nouveau log : ' + message, true));
EventEmitter.on('warn', (message) => new Toast('warning', 'Nouveau warning : ' + message, true));

/* Fonction permettant de récupérer la taille d'une image sur le site */
async function getImageSize(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(Math.round((img.fileSize / 1024) || 0));
    });
}

/* Fonction permettant de vérifier la validité d'une URL */
function isValidURL(url) {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocole
        '((([a-z0-9][a-z0-9-]{0,61}[a-z0-9])\\.)+[a-z]{2,6}|' + // domaine
        'localhost|' + // localhost
        '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|' + // IP
        '\\[?[a-f0-9]*:[a-f0-9:]+\\]?)' + // ou IPv6
        '(\\:\\d+)?(\\/[-a-z0-9%_.~+]*)*' + // chemin
        '(\\?[;&a-z0-9%_.~+=-]*)?' + // requête
        '(\\#[-a-z0-9_.~+=]*)?$', 'i'); // fragment
    return !!pattern.test(url);
}

/* Fonction asynchrone permettant de vérifier les bonnes pratiques SEO du site */
async function checkSEOBestPractices() {
    const toasts = [];
    const performanceTiming = window.performance?.timing || {};
    const loadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;

    if (loadTime > 3000) toasts.push({ type: 'warning', message: 'Le temps de chargement de la page est supérieur à 3 secondes.' });

    const checks = [
        { url: '/robots.txt', message: 'Aucun fichier robots.txt trouvé.' },
        { url: '/sitemap.xml', message: 'Aucun fichier sitemap.xml trouvé.' }
    ];

    for (const { url, message } of checks) {
        try {
            const response = await fetch(url);
            if (!response.ok) toasts.push({ type: 'warning', message });
        } catch {
            toasts.push({ type: 'warning', message: `Erreur lors de la vérification de ${url}.` });
        }
    }

    const seoChecks = [
        { selector: 'meta[charset="UTF-8"]', error: 'Aucune balise <meta> charset trouvée. Ajoutez <meta charset="UTF-8">.' },
        { selector: 'title', error: 'Aucune balise <title> trouvée.' },
        { selector: 'meta[name="description"]', error: 'Aucune balise <meta> description trouvée.' },
        { selector: 'link[rel="canonical"]', warning: 'Aucune balise <link rel="canonical"> trouvée.' },
        { selector: 'meta[name="viewport"]', error: 'Aucune balise <meta> viewport trouvée.' },
        { selector: 'meta[name="robots"]', warning: 'Aucune balise <meta name="robots"> trouvée.' },
        { selector: 'meta[name="author"]', warning: 'Aucune balise <meta name="author"> trouvée.' },
        { selector: 'meta[property="og:title"]', warning: 'Aucune balise Open Graph <meta property="og:title"> trouvée.' },
        { selector: 'meta[property="og:description"]', warning: 'Aucune balise Open Graph <meta property="og:description"> trouvée.' },
        { selector: 'meta[name="twitter:card"]', warning: 'Aucune balise Twitter Card trouvée.' },
        { selector: 'script[type="application/ld+json"]', warning: 'Aucune balise de données structurées trouvée (JSON-LD).' },
    ];

    seoChecks.forEach(({ selector, error, warning }) => {
        const element = document.querySelector(selector);
        if (error && !element) {
            toasts.push({ type: 'error', message: error });
        } else if (warning && !element) {
            toasts.push({ type: 'warning', message: warning });
        } else if (warning && element) {
            if (selector === 'title' && element.innerText.length > 60) {
                toasts.push({ type: 'warning', message: 'La balise <title> est trop longue. Elle devrait faire moins de 60 caractères.' });
            }
            if (selector === 'meta[name="description"]' && element.getAttribute('content').length > 160) {
                toasts.push({ type: 'warning', message: 'La balise <meta> description est trop longue. Elle devrait faire moins de 160 caractères.' });
            }
        }
    });

    const cssFiles = [...document.querySelectorAll('link[rel="stylesheet"]')];
    const jsFiles = [...document.querySelectorAll('script[src]')];

    if (cssFiles.length > 0) {
        cssFiles.forEach(file => {
            if (!file.href.includes('.min.css')) {
                toasts.push({ type: 'warning', message: `Le fichier CSS "${file.href}" n'est pas minifié.` });
            }
        });
    }

    if (jsFiles.length > 0) {
        jsFiles.forEach(file => {
            if (!file.src.includes('.min.js')) {
                toasts.push({ type: 'warning', message: `Le fichier JavaScript "${file.src}" n'est pas minifié.` });
            }
        });
    }

    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headingElements.length === 0) {
        toasts.push({ type: 'error', message: 'Aucune balise d\'en-tête trouvée.' });
    } else {
        let lastTagIndex = 1;
        for (let i = 1; i < headingElements.length; i++) {
            const currentTagIndex = parseInt(headingElements[i].tagName.charAt(1), 10);
            if (currentTagIndex > lastTagIndex) {
                toasts.push({ type: 'warning', message: 'Les balises d\'en-tête ne sont pas correctement imbriquées.' });
                break;
            }
            lastTagIndex = currentTagIndex;
        }
    }

    const imgElements = document.querySelectorAll('img');
    imgElements.forEach(async (img) => {
        if (!img.hasAttribute('alt')) {
            toasts.push({ type: 'warning', message: `L'image "${img.src}" n'a pas d'attribut alt.` });
        }

        const imgSize = await getImageSize(img.src);
        if (imgSize > 200) {
            toasts.push({ type: 'warning', message: `L'image "${img.src}" est trop volumineuse (${imgSize} Ko).` });
        }
    });

    const links = document.querySelectorAll('a');
    links.forEach((link) => {
        const href = link.getAttribute('href');
        if ((href && href.startsWith('http') && !isValidURL(href)) && !href.includes('/wp-admin')) {
            toasts.push({ type: 'warning', message: `Le lien "${href}" n'est pas valide.` });
        }
    });

    if (headingElements.length > 0 && headingElements[0].tagName !== 'H1') {
        toasts.push({ type: 'warning', message: 'La première balise d\'en-tête doit être un <h1>.' });
    }

    const pageUrl = window.location.href;
    const urlPattern = /^[a-z0-9-]+$/;
    if (!urlPattern.test(pageUrl.split('/').pop())) {
        toasts.push({ type: 'warning', message: 'L\'URL de la page n\'est pas lisible.' });
    }

    const formElements = document.querySelectorAll('input, textarea, select');
    formElements.forEach((element) => {
        const id = element.getAttribute('id');
        const label = document.querySelector(`label[for="${id}"]`);
        if (id && !label) {
            toasts.push({ type: 'warning', message: `Le champ de formulaire "${element.name}" n'a pas de label associé.` });
        }
    });

    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
        toasts.push({ type: 'warning', message: 'La page a été accédée via une redirection. Vérifiez les redirections mises en place.' });
    }

    toasts.forEach(({ type, message }, index) => {
        setTimeout(() => {
            new Toast(type, message, false);
        }, index * 300);
    });
}

/* Si le mode de débogage est activé alors on lance le programme */
if (wd_debug.is_debug) {
    window.addEventListener('DOMContentLoaded', () => {
        loadFontAwesome();
        addToastStyles();
        checkSEOBestPractices();
    });
}