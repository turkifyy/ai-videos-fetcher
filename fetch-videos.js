const admin = require('firebase-admin');
const axios = require('axios');
const { format } = require('date-fns');

// Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const MAX_DAILY_VIDEOS = 40;
const TARGET_HOUR = 18; // 6 PM Morocco Time
const REQUEST_DELAY = 1500; // 1.5 seconds delay

// Discord Webhook
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// YouTube Channels
const CHANNELS = [
'UCNQAoLEv87L7NgUp4We3HIg', // CRAZY GREAPA 
'UCuZBxbwknYtE30Qdh0dQ1Tg', // Jacksinfo 
'UC_485Ao_SxlCaBlOZORVsVQ', // Zdak
'UC7zQcu8FeM_RmUJmwJmCh7w', // UrBoyTrev206
'UCNlDLIic5wnXmScZYjXBrjg', // Catalyst
'UCBaJVMx5fcWOHsmPH3IxKKQ', // Wubzzy
'UCYGElWL8dYqreUh9wNb3s2A', // Vines Best Laugh 
'UC2bxGXFgyCS73exzJ_i0zww', // 	Nba Rich
'UCbv_WFkthQxrqRVwLAcRT_Q', // Phenomenon EditZ
'UCfF7GECIz-rj74KMh9S4ilg', // MiAnimation
'UCUnmH8N8k4E7y3dKfCzDKKg', // Brandon B
'UCoJ5osZ535ar2kzHwQMnLsA', // Double Date 
'UCefnOSmxkOzKR3aUdxgVnsQ', // Marulho
'UCQOidFKQBMvLXk7PxGBXWyA', // The Gabriels
'UCYCh5_-In6wtzWR-s_kM03w', // HT Official
'UCym7PDoe2kcT_Z30LQyGy1w', // SIXPATHSSS
'UCq45uL90wzglh4JTSn34YZQ', // MoniLinaFamily
'UCvLHvyLxBwHKAEx5u09vqVw', // Jehiely N Alex
'UCymK_3BWUcoYVVf5D_GmACQ', // Tsuriki Show
'UCjdrGjv4bGt5HvApBe1HADQ', // ElegantBeautybyBritt
'UCcQ18ScARDXR0hf-OMQofsw', // ox_zung 
'UCSYuOoOUKFA3eZ0L8sRXSTQ', //wish SA 
'UCJadYQZAbzhNweKK621hVQg', // Sósia do Vini Jr
'UCYXrKtLb_uC8vlvalVgef3Q', // Shon Edit
'UCgDBOyrroHE07kPmeA-Ukyw', // Anne P
'UCSn-PqF7wU5gXJRpck4ZQIA', // Peter Nguyen
'UCiLjzcRKUqk0IMxhzyyYFyQ', // Wars JR
'UCpCLsVt-9LhvDKvEzE7Kw7A', // Bridon Production LLC Seany Tv
'UCtH7B4OprU9bUYA0xknelng', // LiveRankings
'UCCfKlFlKYBxZ-UU2dWc17IQ', // boxtoxtv
'UCuj-Tt5acrmGbujvRxVv9Fg', // DOVE CLUBB
'UC77xNOzWNYsS8dP2HSkjEEw', //FARUKKHANCR7
'UCQR0MYr5hvRlWIkrRNZ_mLg', // Laugh Hub
'UCYwi1YamkmM9zsm_k27iC_Q', // Tokyo_boy 
'UCtjYtFpwvLoy9gt1GDK2klg', // Kristen Hanby
'UCEr55381WIqO1w_IzgcI5DQ', // Anwar Jibawi
'UCV4uuw1QDPhoiyweotfA5rw', // AdamW
'UC82rNcKjcMnllk_P2cxheJw', // Bebahan
'UCb9A6uotqUiuVCvVp4GMqOg', // Justin Flom
'UCwmGHKwW6AE_NBQ3CNcO9-A'  // Oscars Funny World
];

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});
const db = admin.firestore();

// Channel info cache
const channelCache = new Map();

// Main function
async function fetchVideos() {
  try {
    if (!isRightTime()) {
      console.log('⏳ Not the scheduled time (6 PM Morocco)');
      return;
    }

    if (await isDailyLimitReached()) {
      await sendDiscordNotification(`🎯 Daily limit reached (${MAX_DAILY_VIDEOS} videos)`);
      return;
    }

    const videos = await fetchAllVideos();
    
    if (videos.length > 0) {
      await saveVideos(videos);
      await sendDiscordNotification(
        `✅ Added ${videos.length} videos\n` +
        `📊 Quota used: ${calculateQuota(videos.length)} units\n` +
        `⏰ ${format(new Date(), 'yyyy-MM-dd HH:mm')}`
      );
    } else {
      await sendDiscordNotification('⚠️ No new videos found today');
    }

    await logExecution(videos.length);

  } catch (error) {
    console.error('❌ Main error:', error);
    await logError(error);
    await sendDiscordNotification(`🔴 Execution failed: ${error.message}`);
    process.exit(0);
  }
}

// Helper functions ==============================================

function isRightTime() {
  const now = new Date();
  const moroccoTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }));
  return moroccoTime.getHours() === TARGET_HOUR;
}

async function isDailyLimitReached() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const snapshot = await db.collection('videos')
    .where('timestamp', '>=', todayStart)
    .count()
    .get();

  return snapshot.data().count >= MAX_DAILY_VIDEOS;
}

async function fetchAllVideos() {
  const videos = [];
  
  for (const channelId of CHANNELS) {
    try {
      await delay(REQUEST_DELAY);
      const video = await fetchChannelVideo(channelId);
      if (video) videos.push(video);
    } catch (error) {
      console.error(`❌ ${channelId}:`, error.message);
    }
  }
  
  return videos;
}

async function fetchChannelVideo(channelId) {
  const videoId = await getLatestVideoId(channelId);
  if (!videoId) return null;

  if (await isVideoExists(videoId)) {
    console.log(`⏭️ Skipping existing video: ${videoId}`);
    return null;
  }

  return await getVideoDetails(videoId);
}

async function getLatestVideoId(channelId) {
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}` +
    `&channelId=${channelId}&part=snippet&order=date` +
    `&maxResults=1&type=video&videoDuration=short` +
    `&fields=items(id(videoId))`
  );

  return response.data.items[0]?.id.videoId;
}

async function isVideoExists(videoId) {
  const doc = await db.collection('videos').doc(videoId).get();
  return doc.exists;
}

async function getVideoDetails(videoId) {
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}` +
    `&id=${videoId}&part=snippet,contentDetails,statistics` +
    `&fields=items(snippet(title,thumbnails/high,channelId),contentDetails/duration,statistics)`
  );

  const item = response.data.items[0];
  if (!item) return null;

  if (parseDuration(item.contentDetails.duration) > 180) return null;

  const channelInfo = await getChannelInfo(item.snippet.channelId);

  return {
    videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high.url,
    duration: item.contentDetails.duration,
    creatorUsername: channelInfo.title,
    creatorAvatar: channelInfo.avatar,
    isVerified: channelInfo.isVerified,
    likes: parseInt(item.statistics?.likeCount || 0),
    comments: parseInt(item.statistics?.commentCount || 0),
    isAI: true
  };
}

async function getChannelInfo(channelId) {
  if (channelCache.has(channelId)) {
    return channelCache.get(channelId);
  }

  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}` +
    `&id=${channelId}&part=snippet,status` +
    `&fields=items(snippet(title,thumbnails/high/url),status)`
  );

  const data = response.data.items[0];
  const result = {
    title: data.snippet.title,
    avatar: data.snippet.thumbnails.high.url,
    isVerified: data.status?.longUploadsStatus === "eligible"
  };

  channelCache.set(channelId, result);
  return result;
}

async function saveVideos(videos) {
  const batch = db.batch();
  const now = admin.firestore.FieldValue.serverTimestamp();
  
  videos.forEach(video => {
    const ref = db.collection('videos').doc(video.videoId);
    batch.set(ref, { ...video, timestamp: now });
  });
  
  await batch.commit();
}

async function sendDiscordNotification(message) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('ℹ️ Discord webhook not configured');
    return;
  }

  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      content: message,
      embeds: [{
        color: 0x00FF00, // Green color
        timestamp: new Date().toISOString()
      }]
    });
  } catch (error) {
    console.error('⚠️ Failed to send Discord notification:', error.message);
  }
}

async function logExecution(count) {
  await db.collection('logs').add({
    date: admin.firestore.FieldValue.serverTimestamp(),
    videoCount: count,
    quotaUsed: calculateQuota(count)
  });
}

async function logError(error) {
  await db.collection('errors').add({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    message: error.message,
    stack: error.stack
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return (parseInt(match?.[1] || 0) * 3600) +
        (parseInt(match?.[2] || 0) * 60) +
        (parseInt(match?.[3] || 0));
}

function calculateQuota(videoCount) {
  return videoCount * 102; // 100 (search) + 1 (video) + 1 (channel)
}

// Start the process
fetchVideos();
