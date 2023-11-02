// Spotify constants
const CLIENT_SECRET = 'dd0c3fdf7e4246479dca71531906d96a';
const CLIENT_ID = '124fc499e60746ea831284136dbc7f4f';
const REDIRECT_URI = 'http://127.0.0.1:5500/main.html';
// Scopes
const SCOPE =
  'user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-modify-public user-library-read user-library-modify user-read-playback-position ugc-image-upload';
const TOKEN_ENDPOINT =
  'https://accounts.spotify.com/api/token';
const authorizationCode = new URLSearchParams(
  window.location.search
).get('code');

// Function to store the access token in localStorage
function storeAccessToken(accessToken) {
  localStorage.setItem('spotifyAccessToken', accessToken);
}

// Function to get the access token from localStorage
function getStoredAccessToken() {
  return localStorage.getItem('spotifyAccessToken');
}

// Check for an existing access token when the page loads
const storedAccessToken = getStoredAccessToken();

// Authorize button event listener, sending to Spotify auth page
document
  .querySelector('#authorize')
  .addEventListener('click', () => {
    const authorizeUrl =
      `https://accounts.spotify.com/authorize` +
      `?client_id=${CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${SCOPE}`;

    window.location.href = authorizeUrl;
  });

// Fetch function that authorizes the user
async function getAccessToken() {
  // Check if there's a stored access token
  const storedAccessToken = getStoredAccessToken();

  if (storedAccessToken) {
    return storedAccessToken;
  }

  // If no stored token, fetch a new one
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await response.json();
  const accessToken = data.access_token;

  // Store the access token in localStorage
  storeAccessToken(accessToken);

  return accessToken;
}

// Function to play or pause a song
async function playMusic(accessToken, isPlaying = true) {
  let playEndpoint =
    'https://api.spotify.com/v1/me/player/play';

  const bodyData = {
    // song url
    uris: ['spotify:track:3Z7dieIRSquTYqLVR15mov'],
    // start position
    position_ms: 0,
  };

  if (!isPlaying) {
    // pause function
    playEndpoint =
      'https://api.spotify.com/v1/me/player/pause';
  }
  // response from access token waits for fetch
  const response = await fetch(playEndpoint, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
    body: JSON.stringify(bodyData),
  });
  // checking for response 204 from the API
  if (response.status === 204) {
    if (isPlaying) {
      console.log('Music is now playing.');
    } else {
      console.log('Music is paused.');
    }
  } else {
    console.error('Failed to control playback.');
  }
}

// Add event listeners for playback controls
document
  .getElementById('play')
  .addEventListener('click', async () => {
    const accessToken = await getAccessToken();
    await playMusic(accessToken);
  });

// Check for an existing access token and hide the "Authorize" button if it exists
if (storedAccessToken) {
  document.querySelector('#authorize').style.display =
    'none';
}
