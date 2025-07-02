document.addEventListener("DOMContentLoaded", function () {
    const headerHTML = `
      <header class="main-header">
        <nav class="navbar navbar-expand-lg navbar-dark">
          <div class="container">
            <!-- Logo -->
            <div class="logo">
              <a href="index.html">DİZİ<span>COM</span></a>
            </div>
  
            <!-- Mobile Toggle Button -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
  
            <!-- Navbar Content -->
            <div class="collapse navbar-collapse" id="navbarNav">
              <!-- Navigation Links -->
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <a class="nav-link active" href="index.html"><i class="fas fa-home me-1"></i> Anasayfa</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="diziler.html"><i class="fas fa-tv me-1"></i> Diziler</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="filmler.html"><i class="fas fa-film me-1"></i> Filmler</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#"><i class="fas fa-fire me-1"></i> Trend</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#"><i class="fas fa-comments me-1"></i> Forum</a>
                </li>
              </ul>
  
              <!-- Search Box -->
              <div class="search-box me-3">
                <form class="d-flex" action="#" method="GET">
                  <input class="form-control search-input" type="search" placeholder="Dizi, film, oyuncu ara..." aria-label="Search">
                  <button class="btn search-btn" type="submit">
                    <i class="fas fa-search"></i>
                  </button>
                </form>
              </div>
  
              <!-- User Actions -->
              <div class="user-actions d-flex align-items-center">
                <div class="btn-group" role="group">
                  <a href="#" class="btn btn-sm btn-secondary me-2"><i class="fas fa-users"></i> <span class="d-none d-md-inline">Oyuncular</span></a>
                  <a href="#" class="btn btn-sm btn-secondary me-2"><i class="fas fa-random"></i> <span class="d-none d-md-inline">Rastgele</span></a>
                  <a href="https://mehmetcan1836.github.io/dizicomdownloader/" target="_blank" class="btn btn-sm btn-primary me-2">
                    <i class="fas fa-mobile-alt"></i> <span class="d-none d-md-inline">Uygulama</span>
                  </a>
                  <a href="iletişim.html" class="btn btn-sm btn-outline">
                    <i class="fas fa-envelope"></i> <span class="d-none d-md-inline">İletişim</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    `;
    document.body.insertAdjacentHTML("afterbegin", headerHTML);
  });
  