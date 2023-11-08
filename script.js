/* Script directions
  1. General script
  2. Authorization and token
  3. Search and api data



*/

// 1. General script
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
  // Encode to make uri
)}&scope=${encodeURIComponent(
  // joins the array into a string
  scopes.join(' ')
)}&response_type=code`;

// End of general script

// 2. Authorization and token
// Access token variable
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
    accessToken = null; // error
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
// End of authorization and token

// 3. Search and api data
document
  .querySelector('#search-play-button')

  .addEventListener('click', async () => {
    const query =
      document.getElementById('search-bar').value;
    if (!query) {
      console.log('Please enter a search term.');
      return;
    }

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=1`;

    try {
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const searchData = await response.json();
        const tracks = searchData.tracks.items;
        if (tracks.length > 0) {
          // First track (could be changed to show multiple songs in a)
          const firstTrack = tracks[0];
          console.log(
            'First track found:',
            firstTrack.name,
            'by',
            firstTrack.artists
              .map((artist) => artist.name)
              .join(', ')
          );

          // calling fetch by id
          fetchTrackInfo(firstTrack.id);
        } else {
          console.log(
            'No tracks found with that search term.'
          );
        }
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

// Function to fetch track info by ID
async function fetchTrackInfo(trackId) {
  if (!accessToken) {
    console.error('Access token is not available.');
    return;
  }

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

      // Extract wanted information
      const albumImage = data.album.images[0].url;
      const element =
        document.getElementById('active-window');
      element.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${albumImage}')`;
      const songName = data.name;
      const artistName = data.artists
        .map((artist) => artist.name)
        .join(', ');

      const previewUrl = data.preview_url;
      // Update the album image
      document.getElementById('albumImage').src =
        albumImage;
      document.getElementById(
        'albumImage'
      ).alt = `Album cover for ${songName}`;

      // Update the track information
      document.getElementById('trackInfo').innerHTML = `
        <h2> ${songName}  ${artistName} </h2>
        
      `;

      // Update the audio element's source
      if (previewUrl) {
        const audioElement =
          document.getElementById('audioPreview');
        audioElement.src = previewUrl;
        audioElement.volume = 0.5;
        //reload audio element
        audioElement.load();
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
// Button event to trigger function
document
  .getElementById('search-play-button')
  .addEventListener('click', fetchTrackInfo);

// End of search and api data
