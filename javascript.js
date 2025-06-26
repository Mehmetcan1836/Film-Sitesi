/**
 * Sayfa yüklendiğinde çalışacak ana fonksiyon
 */
const init = () => {
    // Pencere boyutu değiştiğinde çalışacak fonksiyon
    const handleResize = () => {
        // Gerekirse yeniden düzenleme işlemleri
    };
    
    // Hata yönetimi
    const handleError = (e) => {
        console.error('Hata oluştu:', e.error || e.message || e);
    };
    
    // Promise hatalarını yakala
    const handleUnhandledRejection = (e) => {
        console.error('İşlenmemiş Promise hatası:', e.reason || e);
    };
    
    // Olay dinleyicilerini ekle
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Header scroll efekti için değişkenler
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    let lastScroll = 0;
    let ticking = false;
    
    const updateHeader = () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scrolled');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            header.classList.add('scroll-down');
            header.classList.remove('scrolled');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
            header.classList.add('scrolled');
        }
        
        lastScroll = currentScroll;
        ticking = false;
    };
    
    // Scroll olayını dinle
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
    
    // Arama formu işleme
    const searchForm = document.querySelector('.search-box form');
    let searchTimeout;
    
    const handleSearch = (e) => {
        e.preventDefault();
        const searchInput = e.target.querySelector('input[type="text"]');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) return;
        
        // Debounce ile arama işlemi
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            // Arama işlemi burada yapılacak
            console.log('Aranan terim:', searchTerm);
            // Örnek: window.location.href = `arama.html?q=${encodeURIComponent(searchTerm)}`;
            
            // Arama sonuçlarını göster (geçici)
            showNotification(`"${searchTerm}" için arama yapılıyor...`);
        }, 300);
    };
    
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    // Film kartlarına olay dinleyicilerini ekle
    const handleBoxClick = (e) => {
        // Eğer favori butonuna tıklanmışsa işlemi durdur
        if (e.target.closest('.favorite-btn')) return;
        
        // Film detay sayfasına yönlendir
        const link = e.currentTarget.querySelector('a');
        if (link) {
            window.location.href = link.href;
        }
    };
    
    const handleFavoriteClick = function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        this.innerHTML = this.classList.contains('active') ? 
            '<i class="fas fa-heart"></i>' : 
            '<i class="far fa-heart"></i>';
            
        const movieTitle = this.closest('.box').querySelector('h3')?.textContent || 'Film';
        const action = this.classList.contains('active') ? 'eklendi' : 'kaldırıldı';
        showNotification(`"${movieTitle}" favorilerinize ${action}!`);
    };
    
    // Delegasyon kullanarak tek bir olay dinleyicisi ekle
    document.addEventListener('click', (e) => {
        // Film kutusuna tıklama
        const box = e.target.closest('.box');
        if (box) {
            handleBoxClick(e);
            return;
        }
        
        // Favori butonuna tıklama
        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
            handleFavoriteClick.call(favBtn, e);
        }
    });
    
    // Sayfa yüklendikten sonra favori butonlarını ekle
    const addFavoriteButtons = () => {
        const boxes = document.querySelectorAll('.box');
        boxes.forEach(box => {
            const infoPanel = box.querySelector('.info-panel');
            if (infoPanel && !infoPanel.querySelector('.favorite-btn')) {
                const favoriteBtn = document.createElement('button');
                favoriteBtn.className = 'favorite-btn';
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
                favoriteBtn.title = 'Favorilere Ekle';
                infoPanel.appendChild(favoriteBtn);
            }
        });
    };
    
    // Sayfa yüklendikten sonra ve dinamik içerik yüklendikten sonra çalıştır
    const favoriteButtonsObserver = new MutationObserver(addFavoriteButtons);
    favoriteButtonsObserver.observe(document.body, { childList: true, subtree: true });
    addFavoriteButtons();
    
    // Karanlık mod kontrolü
    const initDarkMode = () => {
        const darkModeToggle = document.createElement('button');
        darkModeToggle.className = 'btn btn-secondary dark-mode-toggle';
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        darkModeToggle.title = 'Karanlık Mod';
        darkModeToggle.setAttribute('aria-label', 'Karanlık modu değiştir');
        
        const userActions = document.querySelector('.user-actions');
        if (!userActions) return;
        
        userActions.insertBefore(darkModeToggle, userActions.firstChild);
        
        // Sistem temasını kontrol et
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme');
        let isDark = currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches);
        
        const setTheme = (dark) => {
            document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
            darkModeToggle.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            darkModeToggle.title = dark ? 'Aydınlık Mod' : 'Karanlık Mod';
            localStorage.setItem('theme', dark ? 'dark' : 'light');
            isDark = dark;
        };
        
        // İlk yüklemede temayı ayarla
        setTheme(isDark);
        
        // Tıklama ile tema değiştirme
        darkModeToggle.addEventListener('click', () => setTheme(!isDark));
        
        // Sistem teması değiştiğinde güncelle (isteğe bağlı)
        const handleThemeChange = (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches);
            }
        };
        
        prefersDarkScheme.addEventListener('change', handleThemeChange);
        
        // Temizlik için event listener'ları kaldır
        return () => {
            darkModeToggle.removeEventListener('click', () => setTheme(!isDark));
            prefersDarkScheme.removeEventListener('change', handleThemeChange);
        };
    };
    
    // Karanlık modu başlat
    const cleanupDarkMode = initDarkMode();
    
    // Yükleme animasyonu
    const initAnimations = () => {
        const fadeElements = document.querySelectorAll('.box, .section-header');
        
        // Intersection Observer ile görünür olduğunda animasyonu tetikle
        const animateOnScroll = (elements) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            elements.forEach(el => {
                observer.observe(el);
            });
            
            return observer;
        };
        
        // Sayfa yüklendikten sonra animasyonları başlat
        if ('IntersectionObserver' in window) {
            const animationObserver = animateOnScroll(fadeElements);
            
            // Temizlik için observer'ı kaldır
            return () => {
                animationObserver.disconnect();
            };
        } else {
            // Fallback for older browsers
            const timeouts = [];
            fadeElements.forEach((el, index) => {
                timeouts.push(
                    setTimeout(() => {
                        el.classList.add('fade-in');
                    }, 100 * index)
                );
            });
            
            // Temizlik için timeout'ları temizle
            return () => {
                timeouts.forEach(clearTimeout);
            };
        }
    };
    
    const cleanupAnimations = initAnimations();
    
    // Dinamik yükleme için Intersection Observer
    const initLazyLoading = () => {
        const lazyImages = document.querySelectorAll('img.lazy');
        if (!lazyImages.length) return null;
        
        const lazyLoadObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove('lazy');
                    obs.unobserve(lazyImage);
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => {
            lazyLoadObserver.observe(img);
        });
        
        return lazyLoadObserver;
    };
    
    const lazyLoadObserver = initLazyLoading();
    
    // Temizlik fonksiyonu
    const cleanup = () => {
        // Observer'ları temizle
        if (lazyLoadObserver) {
            lazyLoadObserver.disconnect();
        }
        
        // Diğer temizlik işlemleri
        if (cleanupDarkMode) cleanupDarkMode();
        if (cleanupAnimations) cleanupAnimations();
        
        // Event listener'ları kaldır
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
    };
    
    // Temizlik fonksiyonunu döndür
    return () => {
        cleanup();
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        window.removeEventListener('beforeunload', cleanup);
        window.removeEventListener('error', handleError, true);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
};

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

/**
 * Sayfa dışına tıklandığında açık menüleri kapatır
 * @param {Event} e - Tıklama olayı
 */
const handleDocumentClick = (e) => {
    // Açılır menü örnekleri için
    const dropdowns = document.querySelectorAll('.dropdown');
    const isClickInsideDropdown = Array.from(dropdowns).some(dropdown => 
        dropdown.contains(e.target) || dropdown === e.target
    );
    
    if (!isClickInsideDropdown) {
        // Açık dropdown'ları kapat
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });
    }
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) menu.style.display = 'none';
        }
    });
};

// Doküman tıklama olayını dinle
document.addEventListener('click', handleDocumentClick);

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
