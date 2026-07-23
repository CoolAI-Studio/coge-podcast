import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { syncXml } from './sync-xml.js';

const parser = new Parser();
const LOCAL_FEED_PATH = path.join(process.cwd(), 'public', 'feed_podcast_show.xml');
const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/CoolAI-Studio/coge-podcast/main/feed_podcast_show.xml';

const extractTheme = (description, title) => {
  const text = (title + ' ' + description).toLowerCase();
  
  // 1. Explicit tag check (e.g., #modern_city) to ensure uniqueness and prevent auto-guessing errors
  const explicitMatch = text.match(/#(historical_city|resort|nature_secret|modern_city|general)/);
  if (explicitMatch) return explicitMatch[1];

  // 2. Auto-guessing based on keywords
  if (text.match(/歷史|古蹟|殖民|古城|遺跡|傳奇|historical/)) return 'historical_city';
  if (text.match(/度假|海灘|溫泉|海濱|resort/)) return 'resort';
  if (text.match(/自然|秘境|森林|山脈|湖泊|國家公園|風景|nature/)) return 'nature_secret';
  if (text.match(/現代|都會|商業|繁華|購物|摩天大樓|都會區|modern/)) return 'modern_city';
  return 'general';
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeLocation(locationStr) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationStr)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CogePodcastMapApp/1.0 (coolaistudio@gmail.com)'
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        locationName: data[0].display_name
      };
    }
  } catch (err) {
    console.error(`Geocoding error for ${locationStr}:`, err);
  }
  return null;
}

async function run() {
  try {
    syncXml();
  } catch (err) {
    console.error('Failed to sync XML:', err);
  }

  let feedXml;
  try {
    // 1. Try reading local feed file (works on GitHub Actions since it's checked out in the workspace)
    feedXml = await fs.readFile(LOCAL_FEED_PATH, 'utf-8');
    console.log('Using local feed_podcast_show.xml file.');
  } catch (e) {
    // 2. Fallback to raw GitHub content (works in local dev environment)
    console.log('Local feed file not found. Fetching from raw GitHub URL...');
    try {
      const response = await fetch(RAW_GITHUB_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      feedXml = await response.text();
    } catch (fetchErr) {
      console.error('Failed to fetch from raw GitHub URL:', fetchErr);
      // 3. Absolute fallback
      const oldUrl = 'https://coolai-studio.github.io/coge-podcast/feed_podcast_show.xml';
      console.log(`Falling back to: ${oldUrl}`);
      const response = await fetch(oldUrl);
      feedXml = await response.text();
    }
  }

  console.log('Parsing RSS feed...');
  const feed = await parser.parseString(feedXml);
  
  let episodes = [];
  for (let index = 0; index < feed.items.length; index++) {
    const item = feed.items[index];
    const description = item.contentSnippet || item.content || '';
    
    // Extract chat link using regex
    const chatMatch = description.match(/(?:時空對話|Conversation)\s*[:：]?\s*(https?:\/\/[^\s<]+)/i);
    const chatUrl = chatMatch ? chatMatch[1] : undefined;

    let lat = undefined;
    let lng = undefined;
    let locationName = undefined;
    let theme = extractTheme(description, item.title || '');

    // Extract location name from title, e.g. 【EP1】Mission Viejo - USA
    const titleMatch = (item.title || '').match(/【[^】]+】\s*([^-]+?(?:\s*-\s*[^-]+)?)\s*$/);
    if (titleMatch && titleMatch[1]) {
      const locStr = titleMatch[1].trim().replace(/\s*-\s*/, ', ');
      console.log(`Geocoding extracted location: ${locStr}`);
      const geo = await geocodeLocation(locStr);
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
        locationName = geo.locationName;
      }
      await delay(1500); // Respect Nominatim API limits (1 req/sec)
    }

    episodes.push({
      id: `ep-${index}`,
      title: item.title,
      description: description.replace(/<[^>]*>?/gm, '').trim(),
      pubDate: item.pubDate,
      audioUrl: item.enclosure?.url || '',
      image: item.itunes?.image || feed.image?.url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
      chatUrl,
      lat,
      lng,
      locationName,
      theme
    });
  }

  const publicDir = path.join(process.cwd(), 'public');
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, 'episodes.json'), JSON.stringify({ channelTitle: feed.title || 'Co哥世界人文探索', episodes }, null, 2));
  console.log('Saved episodes.json to public directory.');
}

run().catch(console.error);
