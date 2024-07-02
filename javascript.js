// Get references to the movie list and form
const movieList = document.getElementById('movie-list');
const movieForm = document.getElementById('movie-form');

// Listen for form submissions
movieForm.addEventListener('submit', function(event) {
  // Prevent the form from submitting normally
  event.preventDefault();

  // Get the movie title and director from the form inputs
  const title = document.getElementById('title').value;
  const director = document.getElementById('director').value;

  // Create a new list item
  const listItem = document.createElement('li');
  listItem.textContent = `${title} - ${director}`;

  // Add the list item to the movie list
  movieList.appendChild(listItem);

  // Clear the form inputs
  document.getElementById('title').value = '';
  document.getElementById('director').value = '';
  
  document.getElementById('search-btn').addEventListener('click', function() {
    const searchTerm = document.getElementById('search-box').value;
    window.location.href = `search.html?q=${searchTerm}`;
  });
});
function gizleGoster(liste) {
  var secilenID = document.getElementById(liste);
  if (secilenID.style.display == "") {
      secilenID.style.display = "";
  } else {
  secilenID.style.display = "";
}
}
// Get the comment form and list elements
const commentForm = document.getElementById('comment-form');
const commentList = document.getElementById('comment-list');

// Create an array to store the comments
let comments = [];

// Add an event listener to the comment form
commentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('username-input');
  const commentInput = document.getElementById('comment-input');
  const username = usernameInput.value.trim();
  const commentText = commentInput.value.trim();
  if (username!== '' && commentText!== '') {
    // Create a new comment object
    const comment = {
      username: username,
      text: commentText,
      timestamp: new Date().toLocaleTimeString()
    };
    // Add the comment to the array
    comments.push(comment);
    // Clear the input fields
    usernameInput.value = '';
    commentInput.value = '';
    // Display the comments
    displayComments();
  }
});

// Function to display the comments
function displayComments() {
  // Clear the comment list
  commentList.innerHTML = '';
  // Loop through the comments array
  comments.forEach((comment) => {
    // Create a new comment element
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    // Create a paragraph element for the username and timestamp
    const usernameElement = document.createElement('p');
    usernameElement.textContent = `${comment.username} - ${comment.timestamp}`;
    // Create a paragraph element for the comment text
    const commentTextElement = document.createElement('p');
    commentTextElement.textContent = comment.text;
    // Add the elements to the comment element
    commentElement.appendChild(usernameElement);
    commentElement.appendChild(commentTextElement);
    // Add the comment element to the comment list
    commentList.appendChild(commentElement);
    // Update the comment list to display the new comment
    commentList.scrollTop = commentList.scrollHeight;
  });
}

// Initial call to displayComments to display any existing comments
displayComments();

// Get the slider elements
const sliderContainer = document.querySelector('.slider-container');
const sliderImages = document.querySelectorAll('.slider-images img');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');

// Set the current slide index
let currentSlide = 0;

// Add event listeners to the navigation buttons
prevButton.addEventListener('click', () => {
  currentSlide--;
  updateSlider();
});

nextButton.addEventListener('click', () => {
  currentSlide++;
  updateSlider();
});

// Update the slider
function updateSlider() {
  // Hide all images
  sliderImages.forEach((img) => {
    img.style.opacity = 0;
  });

  // Show the current image
  sliderImages[currentSlide].style.opacity = 1;

  // Check if we've reached the end of the slider
  if (currentSlide === sliderImages.length - 1) {
    nextButton.disabled = true;
  } else {
    nextButton.disabled = false;
  }

  // Check if we've reached the beginning of the slider
  if (currentSlide === 0) {
    prevButton.disabled = true;
  } else {
    prevButton.disabled = false;
  }
}

// Initialize the slider
updateSlider();