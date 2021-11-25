
/**  Create a list of Cities for our Money Heist Characters */
const cities = ['Seattle', 'Vancouver', 'Portland', 'Tokyo', 'Berlin', 'Palermo', 'Nairobi', 'Denver', 'Helsinki', 'Rio', 'Moscow', 'Oslo'];
let randomName = cities[Math.floor(Math.random() * cities.length)];

// We'll pulls some images that have been named after cities... {Money Heist} and replace our city name in URL and add some cloudinary transformations.
let imagePlaceholder = 'https://ga-core.s3.amazonaws.com/production/uploads/instructor/image/15022/thumb_unnamed.jpg'
/**  Update varibles when form input changes */
function updateNameValue(e) {
  randomName = e.target.value;
}

// URL to the Token Server
// See example token server:   https://github.com/dolbyio-samples/communications-api-token-server-netlify 
const tokenServerURL = 'https://dolby-io-tokenserver-lookingglass.netlify.app/api/token-generator';



/**   initializeToken authorization flow on script load  **/
(function () {
  try {
    getTokenAndInitalize()
  } catch (e) {
    alert('Something went wrong initalizaton : ' + e);
  }
})();

/** Fetch our token and start initialization of SDK, update UI sources */
async function getTokenAndInitalize() {
  return fetch(tokenServerURL)
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      VoxeetSDK.initializeToken(result.access_token, refreshToken);
      return result.access_token
    })
    .then((token) => {
      console.info('token received', token);
      initializeConferenceSession()
    })
    .catch((error) => {
      console.error(error);
    });
}

/**  Refresh Token is called when token expiration is 50% completed, this keeps the app initialized */
async function refreshToken() {
  return fetch(tokenServerURL)
    .then((res) => {
      return res.json();
    })
    .then((json) => json.access_token)
    .catch((error) => {
      console.error(error);
    });
}

/**  Create the participantInfo object and open the session with the object  */
async function initializeConferenceSession() {
  let participantInfo = { name: 'Marlon', avatarUrl: imagePlaceholder, externalId: 'Marlon' }
  try {
    // Open a session for the user
    await VoxeetSDK.session.open(participantInfo);
    // Initialize the UI
    initUI();
    console.log('session initialized!');
  } catch (e) {
    alert('Something went wrong: ' + e);
  }
}

/* Dolby.io Event handlers */

// When a stream is added to the conference
VoxeetSDK.conference.on('streamAdded', (participant, stream) => {
  if (stream.type === 'ScreenShare') {
    return addScreenShareNode(stream);
  }
  if (stream.getVideoTracks().length) {
    // Only add the video node if there is a video track
    addVideoNode(participant, stream);
  }
  addParticipantNode(participant);
});

// When a stream is updated
VoxeetSDK.conference.on('streamUpdated', (participant, stream) => {
  if (stream.type === 'ScreenShare') return;
  if (stream.getVideoTracks().length) {
    // Only add the video node if there is a video track
    addVideoNode(participant, stream);
  } else {
    removeVideoNode(participant);
  }
});

// When a stream is removed from the conference
VoxeetSDK.conference.on('streamRemoved', (participant, stream) => {
  if (stream.type === 'ScreenShare') {
    return removeScreenShareNode();
  }
  removeVideoNode(participant);
  removeParticipantNode(participant);
});
