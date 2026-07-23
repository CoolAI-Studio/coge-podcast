import fs from 'fs';
import path from 'path';

const ROOT_FEED_PATH = path.join(process.cwd(), 'feed_podcast_show.xml');
const PUBLIC_FEED_PATH = path.join(process.cwd(), 'public', 'feed_podcast_show.xml');

export function syncXml() {
  if (!fs.existsSync(ROOT_FEED_PATH)) {
    return;
  }
  
  if (!fs.existsSync(PUBLIC_FEED_PATH)) {
    fs.copyFileSync(ROOT_FEED_PATH, PUBLIC_FEED_PATH);
    console.log('✅ Copied root feed_podcast_show.xml to public/feed_podcast_show.xml');
    return;
  }

  console.log('Found feed_podcast_show.xml in root directory. Checking for new episodes...');
  const rootContent = fs.readFileSync(ROOT_FEED_PATH, 'utf8');
  let publicContent = fs.readFileSync(PUBLIC_FEED_PATH, 'utf8');

  const itemRegex = /<item>[\s\S]*?<\/item>/g;
  const rootItems = rootContent.match(itemRegex) || [];
  const publicItems = publicContent.match(itemRegex) || [];

  const getGuid = (itemStr) => {
    const match = itemStr.match(/<guid[^>]*>(.*?)<\/guid>/);
    if (match) return match[1];
    const titleMatch = itemStr.match(/<title>(.*?)<\/title>/);
    return titleMatch ? titleMatch[1] : null;
  };

  const publicGuids = new Set(publicItems.map(getGuid).filter(Boolean));
  let itemsToAdd = [];

  rootItems.forEach(item => {
    const guid = getGuid(item);
    if (guid && !publicGuids.has(guid)) {
      itemsToAdd.push(item);
      publicGuids.add(guid);
    }
  });

  if (itemsToAdd.length > 0) {
    let insertPos = publicContent.indexOf('<item>');
    const endChannelPos = publicContent.indexOf('</channel>');
    const targetPos = insertPos !== -1 ? insertPos : endChannelPos;
    
    const combinedNewItems = itemsToAdd.join('\n  ') + '\n  ';
    publicContent = publicContent.slice(0, targetPos) + combinedNewItems + publicContent.slice(targetPos);
    
    fs.writeFileSync(PUBLIC_FEED_PATH, publicContent, 'utf8');
    console.log(`✅ Synced ${itemsToAdd.length} new episode(s) from root XML to public XML.`);
  } else {
    console.log('✅ No new episodes found in root XML to sync.');
  }
}
