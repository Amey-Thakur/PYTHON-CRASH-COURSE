document.addEventListener('DOMContentLoaded', () => {
    try {
        initTheme();
        renderAll();
        setupEventListeners();
        initScrollAnimations();
        initSecurity();
        startLoading();
    } catch (error) {
        console.error("Website Initialization Error:", error);
        dismissLoader();
    }
});

function startLoading() {
    const bar = document.getElementById('splash-progress-bar');
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(dismissLoader, 500);
        } else {
            width += Math.random() * 15;
            if (width > 100) width = 100;
            bar.style.width = width + '%';
        }
    }, 150);
}

function dismissLoader() {
    const loader = document.getElementById('skeleton-loader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.6s ease';
        setTimeout(() => {
            loader.style.display = 'none';
            initStatsAnimation();
        }, 600);
    }
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function renderAll() {
    renderFeaturedProject();
    renderCurriculum();
    renderCertificates();
}

function renderFeaturedProject() {
    const root = document.getElementById('featured-root');
    const p = featuredProjectData;
    const videoId = "HaiXYHBPHVg";
    root.innerHTML = `
        <div class="featured-card">
            <div class="featured-left">
                <div class="featured-video-wrapper">
                    <iframe 
                        src="https://www.youtube-nocookie.com/embed/HaiXYHBPHVg?rel=0&modestbranding=1" 
                        title="Project Demo" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                <div class="featured-actions">
                    <a href="${p.links.demo}" class="action-pill primary" target="_blank">
                        <i class="fas fa-rocket"></i> Live Demo
                    </a>
                    <a href="${p.links.video}" class="action-pill secondary yt-btn" target="_blank">
                        <i class="fab fa-youtube"></i> Video Demo
                    </a>
                    <a href="${p.links.repo}" class="action-pill secondary" target="_blank">
                        <i class="fab fa-github"></i> Project Repository
                    </a>
                    <a href="${p.links.paper}" class="action-pill secondary" target="_blank">
                        <i class="fas fa-file-alt"></i> Research Paper
                    </a>
                </div>
            </div>
            <div class="featured-content">
                <div class="featured-badge">${p.subtitle}</div>
                <h3>${p.title}</h3>
                <p class="featured-desc">${p.description}</p>
                <div class="featured-features">
                    ${p.points.map(pt => `
                        <div class="feature-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${pt}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderCurriculum() {
    const grid = document.getElementById('day-grid');
    grid.innerHTML = curriculumData.map(day => `
        <div class="day-card reveal" onclick="openNotebook('${day.day}', '${day.title}')">
            <div class="day-header">
                <span class="day-number">Day ${day.day}</span>
                <span class="day-icon">${day.icon}</span>
            </div>
            <h3 class="day-title">${day.title}</h3>
            <div class="day-actions" onclick="event.stopPropagation()">
                <a href="${day.kaggle}" class="action-btn kaggle" target="_blank">Kaggle</a>
                <a href="${day.colab}" class="action-btn colab" target="_blank">Colab</a>
                <button class="action-btn expand" onclick="openNotebook('${day.day}', '${day.title}')">Expand</button>
            </div>
        </div>
    `).join('');
}

function renderCertificates() {
    const grid = document.getElementById('cert-grid');
    grid.innerHTML = certificateData.map((cert, idx) => `
        <div class="cert-card reveal" onclick="openCertModal(${idx})">
            <img src="${cert.image}" class="cert-image" alt="${cert.name}">
            <div class="cert-info">
                <span style="color: var(--accent-green); font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">${cert.recipient}</span>
                <h3 style="margin-top: 0.5rem;">${cert.name}</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">${cert.issuer}</p>
            </div>
        </div>
    `).join('');
}

function openNotebook(day, title) {
    const modal = document.getElementById('notebook-modal');
    const content = document.getElementById('notebook-content');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.innerText = `Module Archive: Day ${day}`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Clear previous controls
    const controls = document.getElementById('notebook-controls');
    if (controls) controls.innerHTML = '';

    content.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 1.5rem; color: var(--text-secondary);">
            <div class="loader-icon" style="width: 50px; height: 50px; border: 3px solid var(--accent-blue); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p>Initializing Python Research Archive...</p>
        </div>
    `;

    // Spin animation for the mini loader
    if (!document.getElementById('spin-style')) {
        const style = document.createElement('style');
        style.id = 'spin-style';
        style.innerHTML = "@keyframes spin { to { transform: rotate(360deg); } }";
        document.head.appendChild(style);
    }

    const dayData = curriculumData.find(d => d.day == day);

    setTimeout(() => {
        content.innerHTML = `<iframe src="notebooks/day${day}.html" style="width:100%; height:100%; border:none; min-height: 500px;"></iframe>`;

        const iframe = content.querySelector('iframe');
        iframe.onload = () => {
            renderNotebookControls(day, dayData);
        };

        // Failsafe for loading errors
        iframe.onerror = () => {
            handleNotebookError(content, dayData ? dayData.colab : '');
        };
    }, 800);
}

function renderNotebookControls(day, dayData) {
    const controls = document.getElementById('notebook-controls');
    if (!controls) return;

    const colabLink = dayData ? dayData.colab : '#';
    let downloadLink = null;

    // Construct Raw GitHub Link for .ipynb Download
    if (colabLink && colabLink.includes('colab.research.google.com/github')) {
        const rawPath = colabLink.replace('https://colab.research.google.com/github/', '');
        downloadLink = `https://raw.githubusercontent.com/${rawPath.replace('/blob/', '/')}`;
    }

    controls.innerHTML = `
        <button class="control-icon-btn download-action" onclick="downloadNotebook('${downloadLink}', 'Python_Day_${day}.ipynb')" title="Download Notebook (.ipynb)">
            <i class="fas fa-download"></i>
        </button>
        <button class="control-icon-btn" onclick="shareNotebook('${colabLink}')" title="Share Notebook">
            <i class="fas fa-share-alt"></i>
        </button>
    `;
}

function downloadNotebook(url, filename) {
    if (!url) {
        alert('Notebook source not available for download.');
        return;
    }

    const btn = document.querySelector('.download-action');
    if (btn) btn.style.opacity = '0.5';

    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
            if (btn) btn.style.opacity = '1';
        })
        .catch(err => {
            console.error('Download failed:', err);
            window.open(url, '_blank');
            if (btn) btn.style.opacity = '1';
        });
}

function shareNotebook(url) {
    const shareData = {
        title: 'Python Crash Course Notebook',
        text: 'Check out this module from my Python Crash Course journey!',
        url: url
    };

    if (navigator.share) {
        navigator.share(shareData).catch(err => copyToClipboard(url));
    } else {
        copyToClipboard(url);
    }
}

function handleNotebookError(container, colabUrl) {
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-blue); margin-bottom: 1.5rem;"></i>
            <h3>Notebook Preview Restricted</h3>
            <p>For the full interactive experience, please view this module directly in Google Colab.</p>
            <a href="${colabUrl || '#'}" target="_blank" class="action-btn colab" style="margin-top: 1.5rem; display: inline-block; padding: 0.8rem 2rem;">Open in Colab</a>
        </div>
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    });
}

function openCertModal(idx) {
    const cert = certificateData[idx];
    const modal = document.getElementById('cert-modal');
    document.getElementById('cert-title').innerText = cert.name;
    document.getElementById('cert-full-image').src = cert.image;

    // Set download link
    const downloadLink = document.getElementById('download-cert-link');
    if (downloadLink) downloadLink.href = cert.image;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function shareCertificate() {
    const certTitle = document.getElementById('cert-title').innerText;
    const shareData = {
        title: certTitle,
        text: `Check out this Python training certificate! #PythonCrashCourse`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(err => copyToClipboard(window.location.href));
    } else {
        copyToClipboard(window.location.href);
    }
}

function setupEventListeners() {
    document.getElementById('theme-toggle').onclick = toggleTheme;
    document.getElementById('share-btn').onclick = sharePage;

    const backToTop = document.getElementById('back-to-top');
    window.onscroll = () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    };

    backToTop.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            document.body.style.overflow = 'auto';
        };
    });

    window.onclick = (e) => {
        if (e.target.className === 'modal') {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
}

function initStatsAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-value'));
                animateCount(target, endValue);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-value').forEach(el => observer.observe(el));
}

function animateCount(el, end) {
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * end);
        el.innerText = end === 100 ? `${current}%` : current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.innerText = end === 100 ? `${end}%` : end;
        }
    }
    requestAnimationFrame(update);
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initSecurity() {
    // Video Loading Logic
    const videoWrapper = document.querySelector('.featured-video-wrapper');
    const iframe = videoWrapper ? videoWrapper.querySelector('iframe') : null;
    if (iframe) {
        iframe.onload = () => {
            videoWrapper.classList.add('loaded');
        };
    }

    // PWA Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker Registered'))
                .catch(err => console.log('Service Worker Failed', err));
        });
    }

    // Security Logic (Refined for IFrames)
    const initSecurity = () => {
        document.addEventListener('contextmenu', e => {
            if (e.target.tagName !== 'IFRAME') e.preventDefault();
        });
        document.addEventListener('keydown', e => {
            if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67))) {
                e.preventDefault();
            }
        });
    };
    initSecurity();

    // 🥚 Personalized Easter Egg: The Truth in Code
    console.log(
        "%c🐍 PYTHON CRASH COURSE ARCHIVE %c\n\nAuthorship: Amey Thakur & Mega Satish\nProject: Python Crash Course\n\n%c\"Challenge successfully completed with Mega Satish.\"",
        "color: #58a6ff; font-size: 24px; font-weight: bold; font-family: 'Inter', sans-serif; text-shadow: 2px 2px 0px rgba(0,0,0,0.2);",
        "color: #f0f6fc; font-size: 16px; font-family: 'Inter', sans-serif; font-weight: 500;",
        "color: #bc8cff; font-style: italic; font-size: 14px;"
    );
}

function sharePage() {
    const shareData = {
        title: 'Python Crash Course | Amey & Mega',
        text: 'Mastering Python in 12 days - Collaborative Journey by Amey & Mega. #PythonChallenge',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(err => copyToClipboard(window.location.href));
    } else {
        copyToClipboard(window.location.href);
    }
}
