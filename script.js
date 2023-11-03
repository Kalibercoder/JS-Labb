// Spotify variables
const clientId = '124fc499e60746ea831284136dbc7f4f';
const clientSecret = '693a9bc95e654947af04369038e6d0f9';
const redirectUri = 'http://127.0.0.1:5500/main.html';
const tokenEndpoint =
  'https://accounts.spotify.com/api/token';

// Scopes
const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify',
];

// AuthorizationUrl

const authorizationUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
  redirectUri
)}&scope=${encodeURIComponent(
  // joins the array into a string
  scopes.join(' ')
)}&response_type=code`;

// Initialize access token variable
let accessToken;

// Function to exchange the authorization code for an access token
async function getAccessToken(authorizationCode) {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + btoa(clientId + ':' + clientSecret),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: redirectUri,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    accessToken = data.access_token; // Store the access token in the global variable
  } else {
    console.error(
      'Error exchanging authorization code for access token:',
      response.status
    );
    accessToken = null; // Handle the error as needed
  }
}

// Event listener for index page authorization button
document
  .querySelector('#authorize')
  .addEventListener('click', () => {
    window.location.href = authorizationUrl;
  });

// Check for and store the authorization code in local storage
const urlParams = new URLSearchParams(
  window.location.search
);
const authorizationCode = urlParams.get('code');

if (authorizationCode) {
  // Store the authorization code in local storage
  localStorage.setItem(
    'spotifyAuthorizationCode',
    authorizationCode
  );

  // Exchange the authorization code for an access token
  getAccessToken(authorizationCode);
}

// Retrieve the stored authorization code (if it exists) and use the access token
const storedAuthorizationCode = localStorage.getItem(
  'spotifyAuthorizationCode'
);

async function fetchTrackInfo() {
  if (!accessToken) {
    console.error('Access token is not available.');
    return;
  }

  // Track id (this should be dynamic based on user input or selection)
  const trackId =
    '6Xe9wT5xeZETPwtaP2ynUz?si=70dd0d6f541c4df2';
  const apiUrl = `https://api.spotify.com/v1/tracks/${trackId}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Extract the required information
      const albumImage = data.album.images[0].url;
      const songName = data.name;
      const artistName = data.artists
        .map((artist) => artist.name)
        .join(', ');
      // This is the URL for the 30-second song preview

      const previewUrl = data.preview_url;
      // Update the album image
      document.getElementById('albumImage-behind').src =
        albumImage;
      document.getElementById('albumImage').src =
        albumImage;
      document.getElementById(
        'albumImage'
      ).alt = `Album cover for ${songName}`;

      // Update the track information
      document.getElementById('trackInfo').innerHTML = `
        <h2> <strong>${songName}</strong></h2>
        <h2> <strong>${artistName}</strong></h2>
      `;

      // Update the audio element's source for the preview (if available)
      if (previewUrl) {
        const audioElement =
          document.getElementById('audioPreview');
        audioElement.src = previewUrl;
        audioElement.load(); // This is necessary to reload the audio element and make the new source effective
      } else {
        console.log('No preview available for this track.');
      }
    } else {
      throw new Error('Failed to fetch track information');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

document
  .getElementById('search-play-button')
  .addEventListener('click', fetchTrackInfo);
