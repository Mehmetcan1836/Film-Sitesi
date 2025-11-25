// Detail page JavaScript
const API_KEY = "999a2c8d29cd1833fa98446f909f19eb"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"
const VIDSRC_BASE_URL = "https://vidsrc.cc"

// Global variables
let currentMedia = null
let currentSeasons = []
let currentSeason = null
let currentEpisode = null

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Initialize detail page
document.addEventListener("DOMContentLoaded", async () => {
    const mediaId = getUrlParameter('id')
    const mediaType = getUrlParameter('type')

    if (!mediaId || !mediaType) {
        showError("Geçersiz içerik ID'si veya türü")
        return
    }

    try {
        await loadMediaDetails(mediaId, mediaType)
    } catch (error) {
        console.error("Error loading media details:", error)
        showError("İçerik detayları yüklenirken hata oluştu")
    }
})

// Load media details
async function loadMediaDetails(mediaId, mediaType) {
    try {
        console.log(`Loading details for ${mediaType} ID: ${mediaId}`)

        const endpoint = mediaType === "movie" ? "movie" : "tv"
        const response = await fetch(
            `${BASE_URL}/${endpoint}/${mediaId}?api_key=${API_KEY}&language=tr-TR&append_to_response=credits,recommendations`
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const media = await response.json()
        currentMedia = { ...media, media_type: mediaType }

        displayMediaDetails(media, mediaType)

        if (mediaType === "tv") {
            currentSeasons = media.seasons || []
            loadSeasons(mediaId)
        }

        console.log("Media details loaded successfully")
    } catch (error) {
        console.error("Error loading media details:", error)
        showError("Detaylar yüklenirken hata oluştu")
    }
}

// Display media details
function displayMediaDetails(media, mediaType) {
    // Set hero background
    const backdropUrl = media.backdrop_path
        ? `${BACKDROP_BASE_URL}${media.backdrop_path}`
        : "/placeholder.svg?height=600&width=1200"

    document.getElementById("detailHero").style.backgroundImage = `url('${backdropUrl}')`

    // Set poster
    const posterUrl = media.poster_path
        ? `${IMAGE_BASE_URL}${media.poster_path}`
        : "/placeholder.svg?height=300&width=200"

    document.getElementById("detailPoster").src = posterUrl
    document.getElementById("detailPoster").alt = media.title || media.name

    // Set title
    const title = media.title || media.name
    document.getElementById("detailTitle").textContent = title
    document.title = `${title} - Dizicom`

    // Set rating
    const rating = media.vote_average ? media.vote_average.toFixed(1) : "N/A"
    document.getElementById("detailRating").textContent = rating

    // Set year
    const releaseDate = media.release_date || media.first_air_date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : "Bilinmiyor"
    document.getElementById("detailYear").textContent = year

    // Set runtime or seasons
    if (mediaType === "movie") {
        if (media.runtime) {
            document.getElementById("detailRuntime").textContent = `${media.runtime} dk`
        } else {
            document.getElementById("runtimeMeta").style.display = "none"
        }
        document.getElementById("seasonsMeta").style.display = "none"
    } else {
        document.getElementById("runtimeMeta").style.display = "none"
        if (media.number_of_seasons) {
            document.getElementById("detailSeasons").textContent = `${media.number_of_seasons} sezon`
            document.getElementById("seasonsMeta").style.display = "flex"
        }
    }

    // Set genres
    const genreTags = document.getElementById("genreTags")
    if (media.genres && media.genres.length > 0) {
        genreTags.innerHTML = media.genres.map(genre =>
            `<span class="genre-tag">${genre.name}</span>`
        ).join("")
    } else {
        genreTags.innerHTML = ""
    }

    // Set overview
    document.getElementById("detailOverview").textContent = media.overview || "Özet bulunamadı."

    // Load cast
    loadCast(media.credits)

    // Load recommendations
    loadRecommendations(media.recommendations, mediaType)

    // Setup watch button
    const watchBtn = document.getElementById("watchBtn")
    if (mediaType === "movie") {
        watchBtn.onclick = () => playMedia(media.id, 'movie')
    } else {
        watchBtn.onclick = () => showEpisodesSection()
    }
}

// Load cast
function loadCast(credits) {
    const castGrid = document.getElementById("castGrid")

    if (!credits || !credits.cast || credits.cast.length === 0) {
        castGrid.innerHTML = '<p class="text-muted">Oyuncu bilgileri bulunamadı.</p>'
        return
    }

    const cast = credits.cast.slice(0, 12) // Show up to 12 actors
    castGrid.innerHTML = cast.map(actor => {
        const profileUrl = actor.profile_path
            ? `${IMAGE_BASE_URL}${actor.profile_path}`
            : "/placeholder.svg?height=120&width=120"

        return `
            <div class="actor-item" onclick="showActorDetails(${actor.id})">
                <div class="actor-image-container">
                    <img src="${profileUrl}" alt="${actor.name}" class="actor-image" onerror="this.src='/placeholder.svg?height=120&width=120'">
                </div>
                <div class="actor-name">${actor.name}</div>
            </div>
        `
    }).join("")
}

// Load recommendations
function loadRecommendations(recommendations, mediaType) {
    const recGrid = document.getElementById("recommendationsGrid")

    if (!recommendations || !recommendations.results || recommendations.results.length === 0) {
        recGrid.innerHTML = '<p class="text-muted">Öneri bulunamadı.</p>'
        return
    }

    const recs = recommendations.results.slice(0, 8)
    recGrid.innerHTML = recs.map(rec => {
        const posterUrl = rec.poster_path
            ? `${IMAGE_BASE_URL}${rec.poster_path}`
            : "/placeholder.svg?height=250&width=180"

        const title = rec.title || rec.name
        const year = (rec.release_date || rec.first_air_date)
            ? new Date(rec.release_date || rec.first_air_date).getFullYear()
            : "Bilinmiyor"

        return `
            <div class="recommendation-item" onclick="goToDetail(${rec.id}, '${mediaType}')">
                <img src="${posterUrl}" alt="${title}" onerror="this.src='/placeholder.svg?height=250&width=180'">
                <div class="rec-info">
                    <div class="rec-title">${title}</div>
                    <div class="rec-meta">${year}</div>
                </div>
            </div>
        `
    }).join("")
}

// Load seasons for TV shows
function loadSeasons(tvId) {
    if (!currentSeasons || currentSeasons.length === 0) {
        document.getElementById("episodesSection").style.display = "none"
        return
    }

    document.getElementById("episodesSection").style.display = "block"

    const seasonButtons = document.getElementById("seasonButtons")
    seasonButtons.innerHTML = currentSeasons
        .filter(season => season.season_number > 0)
        .map(season => `
            <button class="season-btn" onclick="loadEpisodes(${tvId}, ${season.season_number})">
                Sezon ${season.season_number}
            </button>
        `).join("")

    // Load first season by default
    const firstSeason = currentSeasons.find(s => s.season_number > 0)
    if (firstSeason) {
        loadEpisodes(tvId, firstSeason.season_number)
    }
}

// Load episodes for a season
async function loadEpisodes(tvId, seasonNumber) {
    try {
        console.log(`Loading episodes for TV ${tvId}, Season ${seasonNumber}`)

        // Update active season button
        const seasonBtns = document.querySelectorAll(".season-btn")
        seasonBtns.forEach(btn => btn.classList.remove("active"))
        if (event && event.target) {
            event.target.classList.add("active")
        } else {
            // If called programmatically, find and activate the correct button
            const targetBtn = document.querySelector(`.season-btn[onclick*="loadEpisodes(${tvId}, ${seasonNumber})"]`)
            if (targetBtn) {
                targetBtn.classList.add("active")
            }
        }

        const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=tr-TR`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const seasonData = await response.json()
        currentSeason = seasonNumber

        const episodesGrid = document.getElementById("episodesGrid")
        if (seasonData.episodes && seasonData.episodes.length > 0) {
            episodesGrid.innerHTML = seasonData.episodes.map(episode => {
                const posterUrl = episode.still_path
                    ? `${IMAGE_BASE_URL}${episode.still_path}`
                    : "/placeholder.svg?height=140&width=250"

                return `
                    <div class="episode-card" onclick="playEpisode(${tvId}, ${seasonNumber}, ${episode.episode_number})">
                        <img src="${posterUrl}" alt="Episode ${episode.episode_number}" class="episode-poster" onerror="this.src='/placeholder.svg?height=140&width=250'">
                        <div class="episode-info">
                            <div class="episode-number">Bölüm ${episode.episode_number}</div>
                            <div class="episode-title">${episode.name}</div>
                            <div class="episode-overview">${episode.overview || "Açıklama bulunamadı."}</div>
                        </div>
                    </div>
                `
            }).join("")
        } else {
            episodesGrid.innerHTML = '<p class="text-muted">Bu sezonda bölüm bulunamadı.</p>'
        }

        console.log(`Loaded ${seasonData.episodes?.length || 0} episodes`)
    } catch (error) {
        console.error("Error loading episodes:", error)
        document.getElementById("episodesGrid").innerHTML = '<p class="text-muted">Bölümler yüklenirken hata oluştu.</p>'
    }
}

// Show episodes section and scroll to it
function showEpisodesSection() {
    document.getElementById("episodesSection").scrollIntoView({ behavior: "smooth" })
}

// Play media
function playMedia(mediaId, mediaType, season = null, episode = null) {
    let vidsrcUrl = ""
    let playerTitle = ""

    // Helper function to save watch history to localStorage
    function saveWatchHistory(entry) {
        try {
            const WATCH_HISTORY_KEY = "watchHistory"
            let history = JSON.parse(localStorage.getItem(WATCH_HISTORY_KEY)) || { movies: [], tvShows: [] }

            if (entry.mediaType === "movie") {
                // Check if movie already exists in history
                const existingIndex = history.movies.findIndex(m => m.id === entry.id)
                if (existingIndex !== -1) {
                    // Update watchedAt if newer
                    if (new Date(entry.watchedAt) > new Date(history.movies[existingIndex].watchedAt)) {
                        history.movies[existingIndex] = entry
                    }
                } else {
                    history.movies.push(entry)
                }
            } else if (entry.mediaType === "tv") {
                // TV shows stored as array of shows with seasons and episodes
                const showIndex = history.tvShows.findIndex(s => s.id === entry.id)
                if (showIndex === -1) {
                    // New show entry
                    history.tvShows.push({
                        id: entry.id,
                        title: entry.title,
                        poster: entry.poster,
                        seasons: {
                            [entry.season]: {
                                episode: entry.episode,
                                episodeTitle: entry.episodeTitle,
                                watchedAt: entry.watchedAt
                            }
                        }
                    })
                } else {
                    // Existing show, update seasons
                    const show = history.tvShows[showIndex]
                    if (!show.seasons[entry.season]) {
                        show.seasons[entry.season] = {
                            episode: entry.episode,
                            episodeTitle: entry.episodeTitle,
                            watchedAt: entry.watchedAt
                        }
                    } else {
                        // Update if this watchedAt is newer
                        if (new Date(entry.watchedAt) > new Date(show.seasons[entry.season].watchedAt)) {
                            show.seasons[entry.season] = {
                                episode: entry.episode,
                                episodeTitle: entry.episodeTitle,
                                watchedAt: entry.watchedAt
                            }
                        }
                    }
                    history.tvShows[showIndex] = show
                }
            }

            localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history))
        } catch (error) {
            console.error("❌ Watch history save error:", error)
        }
    }

    if (mediaType === "movie") {
        vidsrcUrl = `${VIDSRC_BASE_URL}/v2/embed/movie/${mediaId}`
        playerTitle = currentMedia.title || "Film"
        currentSeason = null
        currentEpisode = null

        // Save movie watch history
        saveWatchHistory({
            id: mediaId,
            title: currentMedia.title || "",
            poster: currentMedia.poster_path ? `https://image.tmdb.org/t/p/w500${currentMedia.poster_path}` : "",
            mediaType: "movie",
            watchedAt: new Date().toISOString()
        })

    } else if (mediaType === "tv" && season !== null && episode !== null) {
        vidsrcUrl = `${VIDSRC_BASE_URL}/v2/embed/tv/${mediaId}/${season}/${episode}`
        playerTitle = `${currentMedia.name || "Dizi"} - S${season}E${episode}`
        currentSeason = season
        currentEpisode = episode

        // Save TV episode watch history
        saveWatchHistory({
            id: mediaId,
            title: currentMedia.name || "",
            poster: currentMedia.poster_path ? `https://image.tmdb.org/t/p/w500${currentMedia.poster_path}` : "",
            season: season,
            episode: episode,
            episodeTitle: currentMedia.overview || "",
            mediaType: "tv",
            watchedAt: new Date().toISOString(),
        })
    }

    if (vidsrcUrl) {
        // Show player section
        document.getElementById("contentSections").style.display = "none"
        document.getElementById("videoPlayerSection").style.display = "block"

        // Set player title
        document.getElementById("playerTitle").textContent = playerTitle

        // Show/hide episode navigation
        const prevBtn = document.getElementById("prevEpisodeBtn")
        const nextBtn = document.getElementById("nextEpisodeBtn")

        if (mediaType === "tv") {
            prevBtn.style.display = "inline-block"
            nextBtn.style.display = "inline-block"
            prevBtn.onclick = () => previousEpisode()
            nextBtn.onclick = () => nextEpisode()
        } else {
            prevBtn.style.display = "none"
            nextBtn.style.display = "none"
        }

        // Load video
        const videoContent = document.getElementById("videoContent")
        videoContent.innerHTML = `<iframe src="${vidsrcUrl}" class="video-iframe" allowfullscreen></iframe>`

        // Scroll to player
        document.getElementById("videoPlayerSection").scrollIntoView({ behavior: "smooth" })

        console.log("Playing media:", playerTitle)
    }
}

// Play episode
function playEpisode(tvId, season, episode) {
    playMedia(tvId, 'tv', season, episode)
}

// Hide player and show content
function hidePlayer() {
    document.getElementById("videoPlayerSection").style.display = "none"
    document.getElementById("contentSections").style.display = "block"
    document.getElementById("videoContent").innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <span>Video yükleniyor...</span>
        </div>
    `
}

// Previous episode
function previousEpisode() {
    if (!currentMedia || currentMedia.media_type !== "tv" || !currentSeason || !currentEpisode) return

    const prevEpisodeNum = currentEpisode - 1
    let prevSeasonNum = currentSeason

    if (prevEpisodeNum < 1) {
        prevSeasonNum = currentSeason - 1
        const prevSeasonData = currentSeasons.find(s => s.season_number === prevSeasonNum)
        if (!prevSeasonData) {
            alert("İlk bölüm oynatılıyor")
            return
        }
        playMedia(currentMedia.id, "tv", prevSeasonNum, prevSeasonData.episode_count)
    } else {
        playMedia(currentMedia.id, "tv", prevSeasonNum, prevEpisodeNum)
    }
}

// Next episode
function nextEpisode() {
    if (!currentMedia || currentMedia.media_type !== "tv" || !currentSeason || !currentEpisode) return

    const nextEpisodeNum = currentEpisode + 1
    let nextSeasonNum = currentSeason

    const currentSeasonData = currentSeasons.find(s => s.season_number === currentSeason)
    if (currentSeasonData && nextEpisodeNum > currentSeasonData.episode_count) {
        nextSeasonNum = currentSeason + 1
        const nextSeasonData = currentSeasons.find(s => s.season_number === nextSeasonNum)
        if (!nextSeasonData) {
            alert("Son bölüm oynatılıyor")
            return
        }
        playMedia(currentMedia.id, "tv", nextSeasonNum, 1)
    } else {
        playMedia(currentMedia.id, "tv", nextSeasonNum, nextEpisodeNum)
    }
}

// Go to detail page
function goToDetail(mediaId, mediaType) {
    window.location.href = `detail.html?id=${mediaId}&type=${mediaType}`
}

function showActorDetails(actorId) {
    // Navigate to actor detail page passing actorId 
    window.location.href = `actor-detail.html?id=${actorId}`;
}

// Show error
function showError(message) {
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #141414; color: #fff;">
            <h2>Hata</h2>
            <p>${message}</p>
            <button onclick="history.back()" class="back-btn" style="margin-top: 20px;">Geri Dön</button>
        </div>
    `
}
