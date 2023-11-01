// Spotify constants
const CLIENT_SECRET = 'dd0c3fdf7e4246479dca71531906d96a';
const CLIENT_ID = '124fc499e60746ea831284136dbc7f4f';
const REDIRECT_URI = 'http://127.0.0.1:5500/index.html';
const SCOPE =
  'user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-modify-public user-library-read user-library-modify user-read-playback-position ugc-image-upload'; // Adjust the scope as needed
const TOKEN_ENDPOINT =
  'https://accounts.spotify.com/api/token';
const authorizationCode = new URLSearchParams(
  window.location.search
).get('code');

// Function to exchange the authorization code for an access token
async function getAccessToken() {
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
  return data.access_token;
}

// Function to play a song (replace 'TRACK_URI' with an actual Spotify track URI)
/* async function playMusic(accessToken) {
  const trackUri = 'spotify:track:7hDc8b7IXETo14hHIHdnhd'; // Replace with your Spotify track URI
  const playEndpoint =
    'https://api.spotify.com/v1/me/player/play';

  const response = await fetch(playEndpoint, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
    body: JSON.stringify({
      uris: [trackUri],
    }),
  });

  if (response.status === 204) {
    console.log('Music is now playing.');
  } else {
    console.error('Failed to start playback.');
  }
} */

// Function to play or pause a song
async function playMusic(accessToken, isPlaying = true) {
  const playEndpoint =
    'https://api.spotify.com/v1/me/player/play';

  const bodyData = {
    uris: ['spotify:track:7hDc8b7IXETo14hHIHdnhd'], // Replace with your Spotify track URI
    position_ms: 0, // Start from the beginning of the track
  };

  if (!isPlaying) {
    // If isPlaying is false, pause the playback
    playEndpoint =
      'https://api.spotify.com/v1/me/player/pause';
  }

  const response = await fetch(playEndpoint, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
    body: JSON.stringify(bodyData),
  });

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

// Authorize with event listener
document
  .getElementById('authorize')
  .addEventListener('click', () => {
    // Redirect the user to the Spotify authorization page
    const authorizeUrl =
      `https://accounts.spotify.com/authorize` +
      `?client_id=${CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${SCOPE}`;

    window.location.href = authorizeUrl;
  });
