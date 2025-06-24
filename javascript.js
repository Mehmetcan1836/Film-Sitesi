// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Header scroll efekti
    const header = document.querySelector('.main-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scrolled');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Aşağı kaydırma
            header.classList.add('scroll-down');
            header.classList.remove('scrolled');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Yukarı kaydırma
            header.classList.remove('scroll-down');
            header.classList.add('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Arama formu işleme
    const searchForm = document.querySelector('.search-box form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[type="text"]');
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                // Arama işlemi burada yapılacak
                console.log('Aranan terim:', searchTerm);
                // Örnek: window.location.href = `arama.html?q=${encodeURIComponent(searchTerm)}`;
                
                // Arama sonuçlarını göster (geçici)
                showNotification(`"${searchTerm}" için arama yapılıyor...`);
            }
        });
    }
    
    // Film kartlarına hover efekti
    const movieBoxes = document.querySelectorAll('.box');
    movieBoxes.forEach(box => {
        // Hover efektleri CSS'de tanımlı, burada ekstra JS efektleri eklenebilir
        
        // Tıklama olayı
        box.addEventListener('click', function(e) {
            // Eğer favori butonuna tıklanmışsa işlemi durdur
            if (e.target.closest('.favorite-btn')) return;
            
            // Film detay sayfasına yönlendir
            const link = this.querySelector('a');
            if (link) {
                window.location.href = link.href;
            }
        });
        
        // Favori butonu ekle
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
        favoriteBtn.title = 'Favorilere Ekle';
        
        favoriteBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Tıklamanın üst öğelere iletilmesini engeller
            this.classList.toggle('active');
            this.innerHTML = this.classList.contains('active') ? 
                '<i class="fas fa-heart"></i>' : 
                '<i class="far fa-heart"></i>';
                
            const movieTitle = this.closest('.box').querySelector('h3').textContent;
            const action = this.classList.contains('active') ? 'eklendi' : 'kaldırıldı';
            showNotification(`"${movieTitle}" favorilerinize ${action}!`);
        });
        
        const infoPanel = box.querySelector('.info-panel');
        if (infoPanel) {
            infoPanel.appendChild(favoriteBtn);
        }
    });
    
    // Karanlık mod kontrolü
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'btn btn-secondary dark-mode-toggle';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.title = 'Karanlık Mod';
    
    const userActions = document.querySelector('.user-actions');
    if (userActions) {
        userActions.insertBefore(darkModeToggle, userActions.firstChild);
        
        // Karanlık mod kontrolü
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme');
        
        if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            darkModeToggle.innerHTML = isDark ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            showNotification(`Karanlık mod ${isDark ? 'açıldı' : 'kapatıldı'}`);
        });
    }
    
    // Yükleme animasyonu
    const fadeElements = document.querySelectorAll('.box, .section-header');
    fadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('fade-in');
        }, 100 * index);
    });
    
    // Dinamik yükleme için Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Sayfadaki tüm .box elementlerini izle
    document.querySelectorAll('.box:not(.fade-in)').forEach(box => {
        observer.observe(box);
    });
});

// Bildirim gösterme fonksiyonu
function showNotification(message, duration = 3000) {
    // Mevcut bir bildirim varsa kaldır
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Stil ekle
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    notification.style.color = 'white';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    
    // Dokümana ekle
    document.body.appendChild(notification);
    
    // Görünür yap
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Belirtilen süre sonra kaldır
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Sayfa dışına tıklandığında açık menüleri kapat
window.addEventListener('click', function(e) {
    // Açılır menü örnekleri için
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) menu.style.display = 'none';
        }
    });
});

// Klavye kısayolları
document.addEventListener('keydown', function(e) {
    // ESC tuşu ile modalları kapat
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    // Karanlık mod için Ctrl+Alt+D kısayolu
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const darkModeToggle = document.querySelector('.dark-mode-toggle');
        if (darkModeToggle) darkModeToggle.click();
    }
});
