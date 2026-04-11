// UI Portfolio System - Local Execution Mode

let portfolioData = {};
let currentActiveTab = '';

// DOM Elements
const sidebarNav = document.getElementById('sidebar-nav');
const contentDisplay = document.getElementById('content-display');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize
init();

function init() {
    try {
        // Parse the locally injected data variable from data.js
        parseDocToData(rawPortfolioData);
        buildNavigation();
        
        // Hide loader immediately since it's local
        loadingOverlay.classList.add('hidden');
        
        // Select first tab by default
        const tabs = Object.keys(portfolioData).filter(tab => tab.toLowerCase() !== 'contact');
        if (tabs.length > 0) {
            selectTab(tabs[0]);
        } else {
            contentDisplay.innerHTML = '<div class="doc-section"><p>No data found.</p></div>';
        }
    } catch (error) {
        console.error('Error loading data:', error);
        sidebarNav.innerHTML = '<p class="nav-loading" style="color:#ff4444">Failed to load data.</p>';
        loadingOverlay.classList.add('hidden');
    }
    
    // Setup Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');

    themeToggleBtn.onclick = () => {
        document.body.classList.toggle('theme-light');
    };
}

// Parses document text into sections based on # [section-name] headers
function parseDocToData(text) {
    const lines = text.split('\n');
    let currentSection = '';
    let currentContent = [];

    for (const line of lines) {
        const sectionMatch = line.match(/^#\s*\[(.*?)\]/);
        if (sectionMatch) {
            if (currentSection) {
                portfolioData[currentSection] = currentContent.join('\n').trim();
            }
            currentSection = sectionMatch[1].toLowerCase();
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    }
    if (currentSection) {
        portfolioData[currentSection] = currentContent.join('\n').trim();
    }
}

function buildNavigation() {
    sidebarNav.innerHTML = ''; // clear loading text
    const tabs = Object.keys(portfolioData).filter(tab => tab.toLowerCase() !== 'contact');
    
    tabs.forEach(tab => {
        const btn = document.createElement('button');
        btn.className = 'nav-item';
        btn.id = 'nav-' + tab;
        btn.innerText = tab;
        btn.onclick = () => selectTab(tab);
        sidebarNav.appendChild(btn);
    });
}

function selectTab(tabName) {
    if (currentActiveTab === tabName) return;
    
    // Update active class on nav
    if (currentActiveTab) {
        const oldBtn = document.getElementById('nav-' + currentActiveTab);
        if (oldBtn) oldBtn.classList.remove('active');
    }
    
    const newBtn = document.getElementById('nav-' + tabName);
    if (newBtn) newBtn.classList.add('active');
    
    currentActiveTab = tabName;
    
    // Animate content change
    contentDisplay.classList.remove('fade-enter');
    // small reflow trick
    void contentDisplay.offsetWidth;
    
    renderContent(tabName);
    contentDisplay.classList.add('fade-enter');
}

function renderContent(tabName) {
    const rawText = portfolioData[tabName] || '';
    const htmlContent = formatToHTML(rawText, tabName);
    contentDisplay.innerHTML = '<div class="doc-section">' + htmlContent + '</div>';
    
    // Scroll to top
    const contentArea = document.querySelector('.content-area');
    if (contentArea) contentArea.scrollTop = 0;
}

// Simple Markdown parser for formatting
function formatToHTML(text, tabName) {
    // Treat the tab name as the main H1 header
    let html = '<h1>' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + '</h1>';
    
    const lines = text.split('\n');
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += '<br>';
            continue;
        }
        
        // Bold parsing: **text**
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Link parsing: [text](http) or just raw http
        line = line.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Check for list items
        if (line.startsWith('- ')) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += '<li>' + line.substring(2) + '</li>';
        } 
        // Check for subheaders (e.g. simple bold text on its own line)
        else if (line.startsWith('<strong>') && line.endsWith('</strong>') && line.length > 20) {
            if (inList) { html += '</ul>'; inList = false; }
            html += '<h3>' + line.replace(/<\/?strong>/g, '') + '</h3>';
        }
        // Normal paragraph
        else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += '<p>' + line + '</p>';
        }
    }
    
    if (inList) {
        html += '</ul>';
    }
    
    return html;
}

// Generic copy to clipboard function
function copyToClipboard(btnElement, textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
        const tooltip = btnElement.querySelector('.tooltip-text');
        if (tooltip) {
            const originalText = tooltip.innerText;
            tooltip.innerText = 'Copied!';
            tooltip.style.color = '#0A84FF';
            setTimeout(() => {
                tooltip.innerText = originalText;
                tooltip.style.color = 'var(--text-primary)';
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Image Modal Functions
function openImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});
