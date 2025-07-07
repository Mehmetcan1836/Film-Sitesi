// Story data
const stories = [
    {
        title: "The Flash",
        image: "img/theflash2023.jpg",
        video: "https://www.youtube.com/embed/hebWYacbdvc?si=v1i3YrEKS2sZVNId"
    },
    {
        title: "Recep İvedik 6",
        image: "img/recepivedik6.jpg",
        video: "https://www.youtube.com/embed/hebWYacbdvc?si=v1i3YrEKS2sZVNId"
    },
    {
        title: "Batman Draculaya Karsi",
        image: "img/batmandraculayakarsi.jpg",
        video: "https://www.youtube.com/embed/hebWYacbdvc?si=v1i3YrEKS2sZVNId"
    },
    {
        title: "Eyvah Eyvah 2",
        image: "img/Eyyvah_Eyvah_2_film_afişi.jpg",
        video: "https://www.youtube.com/embed/hebWYacbdvc?si=v1i3YrEKS2sZVNId"
    },
    {
        title: "Kolpaçino 4 4'lük",
        image: "img/kolpacino.jpg",
        video: "https://www.youtube.com/embed/hebWYacbdvc?si=v1i3YrEKS2sZVNId"
    },
    {
        title: "Parallel",
        image: "img/parallel.webp",
        video: "https://www.youtube.com/embed/hebWYacbdvc?si=v1i3YrEKS2sZVNId"
    },
    {
        title: "Harry Potter",
        image: "img/HarryPoter.webp",
        video: "https://www.youtube.com/embed/hebWYacbdvc?si=v1i3YrEKS2sZVNId"
    },
    {
        title: "Harry Potter 2",
        image: "img/HarryPotter2.jpg",
        video: "https://www.youtube.com/embed/hebWYacbdvc?si=v1i3YrEKS2sZVNId"
    }
];

// Check if URL is a YouTube embed URL
function isYouTubeUrl(url) {
    return url && (url.includes('youtube.com/embed/') || url.includes('youtu.be/'));
}

// Create loading spinner
function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'story-loading';
    return spinner;
}

// Create error message
function createErrorMessage(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.style.color = '#fff';
    error.style.textAlign = 'center';
    error.style.padding = '20px';
    error.style.maxWidth = '80%';
    error.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 40px; margin-bottom: 15px; display: block;"></i>
        <p>${message || 'Bu hikaye şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.'}</p>
    `;
    return error;
}

// Initialize story slider
document.addEventListener('DOMContentLoaded', () => {
    const storyContainer = document.querySelector('.story-container');
    const storyModal = document.querySelector('.story-modal');
    const storyContent = document.querySelector('.story-content');
    let currentPlayer = null;
    let currentIndex = 0;

    // Create story items
    stories.forEach((story, index) => {
        const storyItem = document.createElement('div');
        storyItem.className = 'story-item';
        storyItem.title = story.title;
        storyItem.setAttribute('data-index', index);
        
        const img = document.createElement('img');
        img.src = story.image;
        img.alt = story.title;
        img.loading = 'lazy';
        
        // Add loading state
        img.onerror = () => {
            img.src = 'img/placeholder.jpg'; // Fallback image
        };
        
        storyItem.appendChild(img);
        
        storyItem.addEventListener('click', () => {
            openStory(index);
        });

        storyContainer.appendChild(storyItem);
    });
    
    // Function to open a story
    function openStory(index) {
        if (index < 0 || index >= stories.length) return;
        
        const story = stories[index];
        currentIndex = index;
        
        // Clear previous content
        while (storyContent.firstChild) {
            storyContent.removeChild(storyContent.firstChild);
        }
        
        // Add loading spinner
        const spinner = createLoadingSpinner();
        storyContent.appendChild(spinner);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-story';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', closeModal);
        
        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        let mediaElement;
        
        if (isYouTubeUrl(story.video)) {
            // Create YouTube iframe
            mediaElement = document.createElement('iframe');
            mediaElement.src = story.video + (story.video.includes('?') ? '&' : '?') + 'autoplay=1&mute=1';
            mediaElement.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            mediaElement.setAttribute('allowfullscreen', '');
            mediaElement.setAttribute('frameborder', '0');
        } else {
            // Create video element for direct video files
            mediaElement = document.createElement('video');
            mediaElement.className = 'story-video';
            mediaElement.src = story.video;
            mediaElement.controls = true;
            mediaElement.autoplay = true;
            mediaElement.playsInline = true;
            
            mediaElement.addEventListener('error', () => {
                showError('Video yüklenirken bir hata oluştu.');
            });
        }
        
        // Add media element to container
        videoContainer.appendChild(mediaElement);
        
        // Clear loading spinner when media is loaded
        mediaElement.addEventListener('loadeddata', () => {
            if (spinner.parentNode) {
                spinner.remove();
            }
        });
        
        // Add elements to content
        storyContent.appendChild(videoContainer);
        storyContent.appendChild(closeButton);
        
        // Set current player
        currentPlayer = mediaElement;
        
        // Show modal
        storyModal.classList.add('active');
        
        // Pause any previously playing media
        if (currentPlayer && currentPlayer.pause) {
            currentPlayer.pause();
        }
    }
    
    // Show error message
    function showError(message) {
        const error = createErrorMessage(message);
        storyContent.innerHTML = '';
        storyContent.appendChild(error);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-story';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', closeModal);
        storyContent.appendChild(closeButton);
    }

    // Close story modal
    function closeModal() {
        storyModal.classList.remove('active');
        
        // Stop video/iframe when closing
        if (currentPlayer) {
            if (currentPlayer.pause) {
                currentPlayer.pause();
                currentPlayer.currentTime = 0;
            } else if (currentPlayer.contentWindow) {
                // For iframes, pause the video by removing the src
                const src = currentPlayer.src;
                currentPlayer.src = '';
                // Restore the original src for next time
                setTimeout(() => {
                    currentPlayer.src = src;
                }, 100);
            }
        }
    }


    // Navigation between stories with arrow keys
    function navigateStories(direction) {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < stories.length) {
            openStory(newIndex);
        }
    }

    // Close button and overlay click event
    storyModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-story') || e.target === storyModal) {
            closeModal();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!storyModal.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                navigateStories(-1);
                break;
            case 'ArrowRight':
                navigateStories(1);
                break;
        }
    });
    
    // Swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    storyModal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    storyModal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance to consider it a swipe
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next story
                navigateStories(1);
            } else {
                // Swipe right - previous story
                navigateStories(-1);
            }
        }
    }
});
