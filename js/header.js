document.addEventListener("DOMContentLoaded", function () {
    const headerHTML = `
    

    <header class="main-header">
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <a class="navbar-brand" href="/">
              <h1>Dizi<span>com</span></h1>
          </a>

          <!-- Mobile Search Toggle Button (outside collapse) -->
          <button class="btn btn-link d-lg-none ms-2" id="mobileSearchToggle" style="color: #fff;">
            <i class="fas fa-search"></i>
          </button>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link ${window.location.pathname === '/index.html' || window.location.pathname === '/' ? 'active' : ''}" href="/index.html">
                  <i class="fas fa-home d-lg-none d-inline-block"></i>
                  <span>Anasayfa</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${window.location.pathname === '/diziler.html' ? 'active' : ''}" href="/diziler.html">
                  <i class="fas fa-tv d-lg-none d-inline-block"></i>
                  <span>Diziler</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${window.location.pathname === '/filmler.html' ? 'active' : ''}" href="/filmler.html">
                  <i class="fas fa-film d-lg-none d-inline-block"></i>
                  <span>Filmler</span>
                </a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link" href="#" id="genresToggle" role="button" aria-expanded="false">
                  <i class="fas fa-tags d-lg-none d-inline-block"></i>
                  <span>Türler <i class="fas fa-caret-down ms-1"></i></span>
                </a>
                <div class="dropdown-menu" id="genresMenu" style="min-width:220px; background:#1a1a1a; border:1px solid #222;">
                  <div style="padding:8px 12px; color:#bbb; font-size:0.9rem;">Yükleniyor...</div>
                </div>
              </li>
            </ul>

            <!-- Desktop Search Box -->
            <div class="search-box position-relative d-none d-lg-block">
              <form id="searchForm" class="d-flex">
                <input class="form-control search-input" type="text" id="searchInput" placeholder="Dizi, film, oyuncu ara..." aria-label="Search" autocomplete="off">
                <button class="search-btn" type="button" id="searchButton">
                  <i class="fas fa-search"></i>
                </button>
              </form>
            </div>

            <!-- User Actions (inside collapse for mobile menu) -->
            <div class="user-actions d-lg-flex d-none">
              <a href="https://mehmetcan1836.github.io/dizicomdownloader/" target="_blank" class="btn btn-primary">
                <i class="fas fa-mobile-alt me-1"></i>
                <span class="d-none d-md-inline">Uygulama</span>
              </a>
              <a href="/iletişim.html" class="btn btn-outline">
                <i class="fas fa-envelope me-1"></i>
                <span class="d-none d-md-inline">İletişim</span>
              </a>
            </div>
          </div>

          <!-- Mobile Search Bar (outside collapse) -->
          <div class="mobile-search" id="mobileSearchBar">
            <form id="mobileSearchForm" class="d-flex position-relative">
              <input class="form-control search-input" type="text" id="mobileSearchInput" placeholder="Dizi, film, oyuncu ara..." aria-label="Search" autocomplete="off">
              <button type="button" class="mobile-search-close" id="mobileSearchClose">
                <i class="fas fa-times"></i>
              </button>
            </form>
          </div>
        </div>
      </nav>
    </header>
    `;
    
    // Insert header into header-container or body
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      headerContainer.innerHTML = headerHTML;
    } else {
      document.body.insertAdjacentHTML("afterbegin", headerHTML);
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const searchButton = document.getElementById('searchButton');
    const mobileSearchToggle = document.getElementById('mobileSearchToggle');
    const mobileSearchBar = document.getElementById('mobileSearchBar');
    const mobileSearchClose = document.getElementById('mobileSearchClose');
    const searchDropdown = document.getElementById('searchDropdown');
    const applySearch = document.getElementById('applySearch');
    const clearFilters = document.getElementById('clearFilters');
    const genreTags = document.querySelectorAll('.genre-tags .badge');
    
    // Initialize search inputs with current query if any
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.has('q')) {
        const query = currentParams.get('q');
        if (searchInput) searchInput.value = query;
        if (mobileSearchInput) mobileSearchInput.value = query;
    }
    
    // Toggle mobile search bar
    if (mobileSearchToggle && mobileSearchBar) {
      mobileSearchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileSearchBar.classList.toggle('active');
        if (mobileSearchBar.classList.contains('active')) {
          mobileSearchInput.focus();
        }
      });
      
      mobileSearchClose.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileSearchBar.classList.remove('active');
      });
    }
    
    // Toggle search dropdown (desktop)
    if (searchButton && searchDropdown) {
      searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = searchDropdown.style.display === 'none' || !searchDropdown.style.display;
        searchDropdown.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden) {
          searchInput.focus();
        }
      });
    }
    
    // Close dropdown when clicking outside
    if (searchDropdown) {
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box') && searchDropdown.style.display === 'block') {
          searchDropdown.style.display = 'none';
        }
      });
    }
    
    // Toggle genre selection
    if (genreTags && genreTags.length > 0) {
      genreTags.forEach(tag => {
        tag.addEventListener('click', () => {
          tag.classList.toggle('bg-danger');
          tag.classList.toggle('bg-secondary');
        });
      });
    }

    // Populate Genres dropdown (TMDB)
    (async function loadGenres(){
      const menu = document.getElementById('genresMenu');
      if (!menu) return;
      const API = '999a2c8d29cd1833fa98446f909f19eb';
      try {
        // Fetch movie genres (covers common genres). We'll merge with TV genres if needed.
        const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API}&language=tr-TR`);
        const data = await res.json();
        const genres = data.genres || [];
        if (!genres.length) throw new Error('No genres');
        menu.innerHTML = '';
        genres.forEach(g => {
          const item = document.createElement('button');
          item.className = 'dropdown-item';
          item.style.color = '#e5e5e5';
          item.style.background = 'transparent';
          item.style.border = 'none';
          item.style.textAlign = 'left';
          item.style.padding = '8px 12px';
          item.type = 'button';
          item.textContent = g.name;
          item.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate to search page with genre filter
            const params = new URLSearchParams();
            params.set('genre', g.id);
            params.set('genreName', g.name);
            window.location.href = '/arama.html?' + params.toString();
          });
          menu.appendChild(item);
        });
        // Add a separator and a 'Tümü' option
        const sep = document.createElement('div');
        sep.style.height = '1px';
        sep.style.background = '#222';
        sep.style.margin = '6px 0';
        menu.appendChild(sep);
        const allBtn = document.createElement('button');
        allBtn.className = 'dropdown-item';
        allBtn.type = 'button';
        allBtn.style.color = '#e5e5e5';
        allBtn.textContent = 'Tüm Türler';
        allBtn.addEventListener('click', () => { window.location.href = '/arama.html'; });
        menu.appendChild(allBtn);
      } catch (err) {
        menu.innerHTML = '<div style="padding:8px 12px;color:#bbb">Türler yüklenemedi</div>';
        console.error('Genres load failed', err);
      }
    })();

    // Toggle genres menu when clicking the toggle and close on outside click
    (function attachGenresToggle(){
      const toggle = document.getElementById('genresToggle');
      const menu = document.getElementById('genresMenu');
      if (!toggle || !menu) return;
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = menu.style.display === 'block';
        menu.style.display = isOpen ? 'none' : 'block';
        if (!isOpen) menu.style.zIndex = 1200;
      });
      // close when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#genresMenu') && !e.target.closest('#genresToggle')) {
          if (menu.style.display === 'block') menu.style.display = 'none';
        }
      });
    })();
    
    // Clear filters
    if (clearFilters) {
      clearFilters.addEventListener('click', () => {
        const typeRadios = document.querySelectorAll('input[name="type"]');
        if (typeRadios && typeRadios.length > 0) {
          typeRadios.forEach(radio => {
            if (radio.value === '') radio.checked = true;
            else radio.checked = false;
          });
        }
        
        if (genreTags && genreTags.length > 0) {
          genreTags.forEach(tag => {
            tag.classList.remove('bg-danger');
            tag.classList.add('bg-secondary');
          });
        }
      });
    }
    
    // Apply search
    function performSearch(inputElement) {
      const query = inputElement ? inputElement.value.trim() : '';
      const type = document.querySelector('input[name="type"]:checked')?.value || '';
      const selectedGenres = Array.from(document.querySelectorAll('.genre-tags .bg-danger'))
        .map(tag => tag.textContent.trim());
      
      // Only proceed if there's a search term or filters are applied
      if (query || type || selectedGenres.length > 0) {
        const params = new URLSearchParams();
        
        if (query) params.append('q', query);
        if (type) params.append('type', type);
        if (selectedGenres.length > 0) params.append('genre', selectedGenres.join(','));
        
        // Navigate to search results page
        window.location.href = '/arama.html?' + params.toString();
      } else {
        // If no search term or filters, show all results
        window.location.href = '/arama.html';
      }
      
      // Close dropdown and mobile search after search
      if (searchDropdown) {
        searchDropdown.style.display = 'none';
      }
      if (mobileSearchBar) {
        mobileSearchBar.classList.remove('active');
      }
    }
    
    // Event listeners
    if (applySearch) {
      applySearch.addEventListener('click', () => {
        // Use desktop search input if mobile input is not active
        const activeInput = mobileSearchBar && mobileSearchBar.classList.contains('active') ? mobileSearchInput : searchInput;
        performSearch(activeInput);
      });
    }
    
    // Handle Enter key in search inputs
    function handleSearchKeyPress(e, inputElement) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(inputElement);
      }
    }
    
    // Desktop search input
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => handleSearchKeyPress(e, searchInput));
      
      // Focus the search input when dropdown is shown
      searchInput.addEventListener('focus', () => {
        if (searchDropdown) {
          searchDropdown.style.display = 'block';
        }
      });
      
      // Handle search button click for desktop
      if (searchButton) {
        searchButton.addEventListener('click', (e) => {
          e.preventDefault();
          performSearch(searchInput);
        });
      }
    }
    
    // Mobile search input
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('keypress', (e) => {
        handleSearchKeyPress(e, mobileSearchInput);
      });
      
      // Close mobile search when clicking outside
      document.addEventListener('click', (e) => {
        if (mobileSearchBar && !mobileSearchBar.contains(e.target) && !mobileSearchToggle.contains(e.target)) {
          mobileSearchBar.classList.remove('active');
        }
      });
      
      // Handle mobile search form submission
      const mobileSearchForm = document.getElementById('mobileSearchForm');
      if (mobileSearchForm) {
        mobileSearchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          performSearch(mobileSearchInput);
        });
      }
    }
    // header.js
document.addEventListener('DOMContentLoaded', async function() {
  // Film sayfasında izlenme takibi
  const movieId = new URLSearchParams(window.location.search).get('id');
  if (movieId) {
      try {
          await fetch(`/api/movies/${movieId}/views`, {
              method: 'POST'
          });
      } catch (error) {
          console.error('İzlenme takibi başarısız:', error);
      }
  }

  // Popüler içerikleri yükle
  try {
      const [movies, series] = await Promise.all([
          fetch('/api/popular/movies').then(res => res.json()),
          fetch('/api/popular/series').then(res => res.json())
      ]);

      // Popüler filmleri göster
      displayPopularMovies(movies);
      // Popüler dizileri göster
      displayPopularSeries(series);
  } catch (error) {
      console.error('Popüler içerik yüklenemedi:', error);
  }
});
  });
  