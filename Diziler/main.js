// Sayfa yüklendiğinde ana içeriği yükle
document.addEventListener('DOMContentLoaded', () => {
    fetch('main-content.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('main-content').innerHTML = html;
            initScripts();
        });
});

function initScripts() {
    // Theme Toggle
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.style.position = 'fixed';
    themeToggle.style.bottom = '20px';
    themeToggle.style.right = '20px';
    themeToggle.style.zIndex = '1000';
    themeToggle.style.background = 'var(--primary)';
    themeToggle.style.border = 'none';
    themeToggle.style.borderRadius = '50%';
    themeToggle.style.width = '50px';
    themeToggle.style.height = '50px';
    themeToggle.style.color = 'white';
    themeToggle.style.cursor = 'pointer';
    themeToggle.style.display = 'flex';
    themeToggle.style.alignItems = 'center';
    themeToggle.style.justifyContent = 'center';
    themeToggle.style.fontSize = '1.2rem';
    themeToggle.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    document.body.appendChild(themeToggle);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fas fa-sun';
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            icon.className = 'fas fa-moon';
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    });

    // Load theme preference
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
        const icon = themeToggle.querySelector('i');
        icon.className = 'fas fa-sun';
    }

    // Comment system
    document.querySelector('.comment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = this.querySelector('input').value;
        const comment = this.querySelector('textarea').value;
        if (name && comment) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'episode-item';
            commentDiv.innerHTML = `
                <strong>${name}</strong>
                <p>${comment}</p>
                <small>${new Date().toLocaleString()}</small>
            `;
            document.getElementById('comments-container').prepend(commentDiv);
            this.reset();
            // Save to localStorage
            const comments = JSON.parse(localStorage.getItem('comments') || '[]');
            comments.unshift({ name, comment, date: new Date().toISOString() });
            localStorage.setItem('comments', JSON.stringify(comments));
        }
    });

    // Load comments
    function loadComments() {
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        const container = document.getElementById('comments-container');
        if (comments.length === 0) {
            container.innerHTML = '<p>Henüz yorum yok. İlk yorumu siz yapın!</p>';
            return;
        }
        container.innerHTML = '';
        comments.forEach(item => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'episode-item';
            commentDiv.innerHTML = `
                <strong>${item.name}</strong>
                <p>${item.comment}</p>
                <small>${new Date(item.date).toLocaleString()}</small>
            `;
            container.appendChild(commentDiv);
        });
    }
    loadComments();
}