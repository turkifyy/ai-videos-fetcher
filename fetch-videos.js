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
'UCbCmjCuTUZos6Inko4u57UQ', // Cocomelon - Nursery Rhymes
'UCpEhnqL0y41EpW2TvWAHD7Q', // SET India
'UCbp9MyKCTEww4CxEzc_Tp0Q', //Stokes Twins
'UCJ5v_MCY6GNUBTO8-D3XoAg', // WWE 
'UCyoXW-Dse7fURq30EWl_CUA', // Goldmines
'UCiVs2pnGW5mLIc1jS2nxhjg', // 김프로KIMPRO
'UC6-F5tO8uklgE9Zy8IvbdFw', // Sony SAB
'UCOmHUn--16B90oW2L6FRR3A', //BLACKPINK
'UC5gxP-2QqIh_09djvlm9Xcg', // Alan's Universe
'UCRijo3ddMTht_IHyNSNXpNQ', //Dude Perfect
'UC295-Dw_tDNtZXFeAPAW6Aw', // 5Minute Crafts  
'UC3gNmTGu-TTbFPpfSs5kNkg', // Movieclips 
'UC9CoOnJkIBMdeijd9qYoT_g', // Ariana Grande
'UC0C-w0YjGpqDXGB8IHb662A', // Ed Sheeran 
'UCIwFjwMjI0y7PDBVEO9-bkQ', // Justin Bieber
'UCEdvpU2pFRCVqU6yIPyTpMQ', // Marshmello
'UCfM3zsQsOnfWNUppiycmBuw', // EminemMusic
'UC2tsySbe9TNrI-xh2lximHA', // A4
'UCWrmbQy_KxoBTAHCU7HiErg', // ARGEN
'UCZFBnnCCO65xMXOdtFz8CfA', // Sofi Manassyan 
'UCf07_zJEZAfr8vPof-2cjTQ', // FlashPass
'UCUcfej7lPDoeqTlferD2mcw', // Czn Burak
'UC2J3OlDA_lvVylS4nWy26fw', // NOTSR7
'UCHCbPLCd3nEAlNl2C55rsJg', // Date With Gym
'UC2-MyyXdijbIFiUYQlMit8w', // bonnii
'UCbH8ThM1Mkr19tl4tDOTDDQ', // BroxEditZ
'UCKGyZt16D8aztPPqMwwemxA', // Cars911
'UCiV4OPgaUfwX3HvktO9YPtA', // Foodie Mama 
'UCFBPLzH1iphF9fy-52DYzAg', // Chocodogger
'UCDeH8IeKqvzn8x_iZPAuIfA', // mreviatar
'UCcAoZZkCKvoqSJmVbRaSsDg', // Роман Magic
'UCSbKI3s_8tg3KeQ4R4_6c6g', // Linguini
'UCvoNmw8SGGBVMtSgiQSZK2Q', // mister bombastic
'UC9u3v8d3eSKHLgre8PgUV6A', // BuzzGo
'UCX6r4rkU7Js0HTWDPLTl1dg', // Respect 100M
'UCxnOf_DD412wLKhjgqTt9Mw', // Valerie Lungu
'UCjJ07jOCA8TsqOCtD2324WQ', // Txmshorts
'UC6NJVNuibWilqOTeNCWZVIg', // Hoanftbl
'UCeP5A8YIEQ61tFiav8vzJDg', // narchooo
'UCYRrP22txtZdPr7t2IxkR9w', // Ironaldox
'UC1a2ZCw7tugRZYRMnecNj3A'  // Celine Dept
 
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
