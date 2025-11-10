// Video player functions
function initializePlayer(videoUrl, elementId) {
    const player = document.getElementById(elementId);
    if (player) {
        player.src = videoUrl;
    }
}

// Episode navigation
function navigateEpisode(direction, currentEpisode, totalEpisodes, baseUrl) {
    const nextEp = direction === 'next' ? 
        Math.min(currentEpisode + 1, totalEpisodes) : 
        Math.max(currentEpisode - 1, 1);
    
    if (nextEp !== currentEpisode) {
        window.location.href = `${baseUrl}${nextEp}.html`;
    }
}

// Watch state management
function markAsWatched(seriesId, seasonNum, episodeNum) {
    const watchedKey = `watched_${seriesId}`;
    let watched = JSON.parse(localStorage.getItem(watchedKey) || '{}');
    
    if (!watched[seasonNum]) {
        watched[seasonNum] = {};
    }
    
    watched[seasonNum][episodeNum] = true;
    localStorage.setItem(watchedKey, JSON.stringify(watched));
    
    // Update UI
    const episodeElement = document.querySelector(`[data-episode="${episodeNum}"]`);
    if (episodeElement) {
        episodeElement.classList.add('watched');
    }
}

// Initialize season selector
function initializeSeasonSelector(seriesId, totalSeasons, currentSeason) {
    const selector = document.getElementById('seasonSelector');
    if (!selector) return;
    
    for (let i = 1; i <= totalSeasons; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Sezon ${i}`;
        option.selected = i === currentSeason;
        selector.appendChild(option);
    }
    
    selector.addEventListener('change', (e) => {
        window.location.href = `../season${e.target.value}/index.html`;
    });
}

// Load episode details
async function loadEpisodeDetails(seriesId, seasonNum, episodeNum) {
    try {
        const response = await fetch(`/data/episodes/${seriesId}_s${seasonNum}.json`);
        const data = await response.json();
        const episode = data.episodes.find(ep => ep.episode === episodeNum);
        
        if (episode) {
            document.getElementById('episodeTitle').textContent = episode.title;
            document.getElementById('episodeDescription').textContent = episode.description;
            document.getElementById('episodeDate').textContent = episode.airDate;
        }
    } catch (error) {
        console.error('Error loading episode details:', error);
    }
}
