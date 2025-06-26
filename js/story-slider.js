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
        video: "https://video.sibnet.ru/shell.php?videoid=5445834"
    },
    {
        title: "Eyvah Eyvah 2",
        image: "img/Eyyvah_Eyvah_2_film_afişi.jpg",
        video: "https://video.sibnet.ru/shell.php?videoid=4990835"
    },
    {
        title: "Kolpaçino 4 4'lük",
        image: "img/kolpacino.jpg",
        video: "https://video.sibnet.ru/shell.php?videoid=4990854"
    },
    {
        title: "Parallel",
        image: "img/parallel.webp",
        video: "https://video.sibnet.ru/shell.php?videoid=5150223"
    },
    {
        title: "Harry Potter",
        image: "img/HarryPoter.webp",
        video: "https://video.sibnet.ru/shell.php?videoid=5150223"
    },
    {
        title: "Harry Potter2",
        image: "img/HarryPotter2.jpg",
        video: "https://video.sibnet.ru/shell.php?videoid=5150223"
    }
];

// Check if URL is a YouTube embed URL
function isYouTubeUrl(url) {
    return url.includes('youtube.com/embed/') || url.includes('youtu.be/');
}

// Initialize story slider
document.addEventListener('DOMContentLoaded', () => {
    const storyContainer = document.querySelector('.story-container');
    const storyModal = document.querySelector('.story-modal');
    const storyContent = document.querySelector('.story-content');
    let currentPlayer = null;

    // Create story items
    stories.forEach((story, index) => {
        const storyItem = document.createElement('div');
        storyItem.className = 'story-item';
        storyItem.innerHTML = `
            <img src="${story.image}" alt="${story.title}">
        `;
        
        storyItem.addEventListener('click', () => {
            // Clear previous content
            while (storyContent.firstChild) {
                storyContent.removeChild(storyContent.firstChild);
            }
            
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.className = 'close-story';
            closeButton.innerHTML = '&times;';
            
            if (isYouTubeUrl(story.video)) {
                // Create YouTube iframe
                const iframe = document.createElement('iframe');
                iframe.src = story.video + (story.video.includes('?') ? '&' : '?') + 'autoplay=1&mute=1';
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                
                storyContent.appendChild(iframe);
                currentPlayer = iframe;
            } else {
                // Create video element for direct video files
                const video = document.createElement('video');
                video.className = 'story-video';
                video.src = story.video;
                video.controls = true;
                video.autoplay = true;
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'contain';
                
                storyContent.appendChild(video);
                currentPlayer = video;
            }
            
            storyContent.appendChild(closeButton);
            storyModal.classList.add('active');
        });

        storyContainer.appendChild(storyItem);
    });

    // Close story modal
    function closeModal() {
        storyModal.classList.remove('active');
        // Stop video/iframe when closing
        if (currentPlayer) {
            if (currentPlayer.pause) {
                currentPlayer.pause();
                currentPlayer.currentTime = 0;
            } else if (currentPlayer.contentWindow) {
                // For iframes, we can't directly control them, so we remove the src
                currentPlayer.src = currentPlayer.src.replace('&autoplay=1', '').replace('?autoplay=1', '');
            }
        }
    }


    // Close button event
    storyModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-story') || e.target === storyModal) {
            closeModal();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && storyModal.classList.contains('active')) {
            closeModal();
        }
    });
});
