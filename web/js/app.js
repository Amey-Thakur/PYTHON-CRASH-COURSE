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
        setTimeout(() => loader.style.display = 'none', 600);
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
    root.innerHTML = `
        <div class="featured-card" onclick="window.open('${p.links.repo}', '_blank')">
            <div class="featured-image-wrapper">
                <img src="${p.thumbnail}" alt="Project Thumbnail">
            </div>
            <div class="featured-content">
                <span class="featured-subtitle">${p.subtitle}</span>
                <h3>${p.title}</h3>
                <p style="margin-bottom: 2rem; color: var(--text-secondary);">${p.description}</p>
                <ul class="featured-points">
                    ${p.points.map(pt => `<li>${pt}</li>`).join('')}
                </ul>
                <div class="featured-links" onclick="event.stopPropagation()">
                    <a href="${p.links.demo}" class="link-btn primary" target="_blank"><i class="fas fa-rocket"></i> Live Demo</a>
                    <a href="${p.links.paper}" class="link-btn secondary" target="_blank"><i class="fas fa-file-pdf"></i> Research Paper</a>
                    <a href="${p.links.video}" class="link-btn secondary" target="_blank"><i class="fab fa-youtube"></i> Video Demo</a>
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
                <a href="${day.kaggle}" class="action-btn" target="_blank">Kaggle</a>
                <a href="${day.colab}" class="action-btn" target="_blank">Colab</a>
                <button class="action-btn" onclick="openNotebook('${day.day}', '${day.title}')">Expand</button>
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
    document.getElementById('modal-title').innerText = `Module Archive: Day ${day}`;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    content.innerHTML = `<iframe src="notebooks/day${day}.html" style="width:100%; height:100%; border:none;"></iframe>`;
}

function openCertModal(idx) {
    const cert = certificateData[idx];
    const modal = document.getElementById('cert-modal');
    document.getElementById('cert-title').innerText = cert.name;
    document.getElementById('cert-full-image').src = cert.image;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
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
    // Disable Right Click
    document.oncontextmenu = () => false;

    // Disable Keyboard Shortcuts
    document.onkeydown = (e) => {
        if (e.keyCode === 123 || // F12
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // I, J, C
            (e.ctrlKey && e.keyCode === 85)) { // U
            return false;
        }
    };

    // 🥚 Personalized Easter Egg: The Truth in Code
    console.log(
        "%c🐍 PYTHON CRASH COURSE ARCHIVE %c\n\nAuthorship: Amey Thakur & Mega Satish\nProject: Python Crash Course\n\n%c\"Challenge successfully completed with Mega Satish.\"",
        "color: #58a6ff; font-size: 24px; font-weight: bold; font-family: 'Inter', sans-serif; text-shadow: 2px 2px 0px rgba(0,0,0,0.2);",
        "color: #f0f6fc; font-size: 16px; font-family: 'Inter', sans-serif; font-weight: 500;",
        "color: #bc8cff; font-style: italic; font-size: 14px;"
    );
}
