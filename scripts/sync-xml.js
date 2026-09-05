import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────
// 訂閱源的規則（2026-09-04 寫死成程式碼，不再只是慣例）
//
// 製作人問的兩件事：
//   Q1「某一邊寫 EP12，另一邊也寫 EP12，但是不同的 EP12，會不會衝突？」
//   Q2「某一邊寫 EP12，另一邊寫 EP13，合起來都看得到，
//       但遇到只剩一邊的情況，是不是有的集數就不見了？」
//
// 舊版是「合併」：public/ 有什麼就留什麼，root 有的再插進去。
// 在那個規則下，Q1 會產生兩集 EP12（guid 不同，兩個都留下），
// Q2 會讓 public/ 獨有的 EP13 在只剩 root 的情況下消失。
// 兩件事都會發生，而且**不會報錯**。
//
// 新規則，三句話：
//   1. 根目錄的 feed_podcast_show.xml 是**唯一正本**。上架流程只寫這一份。
//   2. public/feed_podcast_show.xml 是**正本的複本**，由這支程式產生。
//      任何人都不可以直接改它。
//   3. 這支程式在複製之前先驗，違反就**讓建置失敗**（不是警告，是失敗）。
//
// 驗什麼：
//   a. 正本自己不可以有重複的 guid。
//   b. 正本自己不可以有重複的集數編號（兩個 EP12 就是撞號）。
//   c. public/ 不可以有正本沒有的 guid —— 有的話代表有人直接改了 public/，
//      這正是 Q1／Q2 的入口，當場擋下來。
//   d. 正本的集數不可以比現有的 public/ 少（防止正本被整檔覆蓋寫壞）。
//   e. 頻道封面不可以被改掉。
//
// 為什麼要有 (e)：2026-09-05 頻道封面真的被換掉過一次。
// 我當時的「頻道抬頭沒變動」檢查只比對標籤與文字內容，
// 而 <itunes:image href="..."> 的網址是**屬性**，不是文字 ——
// 於是封面被換掉，檢查照樣通過，Spotify 與 Apple 上的節目封面就變了。
//
// 製作人的規則是：「archive.org 和 feed 上的封面，上架永遠都不動，
// 我們只動還沒上架的部分。」現在把它寫成程式碼。
//
// 建置失敗時 GitHub Pages 會**保留上一次成功的部署**，
// 所以「擋下來」的後果是站停在上一版，不是掉集數。
// ─────────────────────────────────────────────────────────────

const ROOT_FEED_PATH = path.join(process.cwd(), 'feed_podcast_show.xml');
const PUBLIC_FEED_PATH = path.join(process.cwd(), 'public', 'feed_podcast_show.xml');

const ITEM_RE = /<item>[\s\S]*?<\/item>/g;

// 頻道封面。這個值是**故意寫死**的：它就是規則本身。
// 要換封面必須有人在這裡動手，而且會留在版本紀錄裡 ——
// 不可以由任何自動流程、任何一次上架、任何一次覆寫悄悄改掉。
const EXPECTED_CHANNEL_IMAGE =
  'https://ia800404.us.archive.org/7/items/coge-world-podcast-v2/Podcast%20cover.jpg';

// 頻道層 = 第一個 <item> 之前的部分。單集自己的 <itunes:image> 不算。
function channelHead(xml) {
  const i = xml.indexOf('<item>');
  return i === -1 ? xml : xml.slice(0, i);
}

function channelImages(xml) {
  const head = channelHead(xml);
  const out = [];
  // 屬性寫法：<itunes:image href="..."/>
  for (const m of head.matchAll(/<itunes:image[^>]*\shref\s*=\s*"([^"]*)"/g)) {
    out.push({ where: 'itunes:image[href]', url: m[1].trim() });
  }
  // 文字寫法：<image><url>...</url></image>
  for (const m of head.matchAll(/<image>[\s\S]*?<url>([\s\S]*?)<\/url>[\s\S]*?<\/image>/g)) {
    out.push({ where: 'image/url', url: m[1].trim() });
  }
  return out;
}

function itemsOf(xml) {
  return xml.match(ITEM_RE) || [];
}

function guidOf(itemStr) {
  const m = itemStr.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
  if (m) return m[1].trim();
  const t = itemStr.match(/<title>([\s\S]*?)<\/title>/);
  return t ? t[1].trim() : null;
}

// `coge_podcast_podcast_show_EP10_X` → 10；找不到回 null。
function episodeNumberOf(itemStr) {
  const key = guidOf(itemStr) || '';
  const title = (itemStr.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1];
  const found = (key + ' ' + title).match(/EP(\d+)/g);
  if (!found) return null;
  return Math.max(...found.map((s) => parseInt(s.slice(2), 10)));
}

function duplicates(list) {
  const seen = new Set();
  const dup = new Set();
  for (const v of list) {
    if (v === null || v === undefined) continue;
    if (seen.has(v)) dup.add(v);
    seen.add(v);
  }
  return [...dup];
}

class FeedRuleError extends Error {}

export function syncXml() {
  if (!fs.existsSync(ROOT_FEED_PATH)) {
    throw new FeedRuleError(
      '找不到根目錄的 feed_podcast_show.xml。那是唯一正本，沒有它不可以繼續建置。'
    );
  }

  const rootContent = fs.readFileSync(ROOT_FEED_PATH, 'utf8');
  const rootItems = itemsOf(rootContent);

  if (rootItems.length === 0) {
    throw new FeedRuleError('正本裡一集都沒有，拒絕用它覆蓋 public/。');
  }

  // ── (a) 正本不可以有重複的 guid ──────────────────────────
  const rootGuids = rootItems.map(guidOf);
  const dupGuid = duplicates(rootGuids);
  if (dupGuid.length) {
    throw new FeedRuleError(
      `正本裡有重複的 guid：${dupGuid.join('、')}。` +
        '同一集出現兩次會讓 Spotify／Apple 顯示重複，拒絕建置。'
    );
  }

  // ── (b) 正本不可以撞集數 ────────────────────────────────
  const dupEp = duplicates(rootItems.map(episodeNumberOf));
  if (dupEp.length) {
    throw new FeedRuleError(
      `正本裡有兩集用了同一個集數編號：EP${dupEp.join('、EP')}。` +
        '這通常是同一集被上架兩次、或兩座不同城市被編成同一集，拒絕建置。'
    );
  }

  // ── (e) 頻道封面不可以被改掉 ────────────────────────────
  const images = channelImages(rootContent);
  if (images.length === 0) {
    throw new FeedRuleError(
      '正本的頻道抬頭裡找不到封面（<itunes:image href> 或 <image><url>）。' +
        '封面掉了會讓 Spotify／Apple 顯示空白節目圖，拒絕建置。'
    );
  }
  const wrong = images.filter((x) => x.url !== EXPECTED_CHANNEL_IMAGE);
  if (wrong.length) {
    throw new FeedRuleError(
      '頻道封面被改掉了：\n' +
        wrong.map((x) => `  ${x.where} = ${x.url}`).join('\n') +
        `\n應該是：\n  ${EXPECTED_CHANNEL_IMAGE}\n` +
        '已上架的封面永遠不動。如果真的要換，請直接改 sync-xml.js 裡的 ' +
        'EXPECTED_CHANNEL_IMAGE，讓這次更動留在版本紀錄裡。'
    );
  }

  const publicExists = fs.existsSync(PUBLIC_FEED_PATH);

  if (publicExists) {
    const publicContent = fs.readFileSync(PUBLIC_FEED_PATH, 'utf8');
    const publicItems = itemsOf(publicContent);

    // ── (c) public/ 不可以有正本沒有的集數 ──────────────────
    const rootGuidSet = new Set(rootGuids);
    const orphan = publicItems.map(guidOf).filter((g) => g && !rootGuidSet.has(g));
    if (orphan.length) {
      throw new FeedRuleError(
        `public/feed_podcast_show.xml 裡有 ${orphan.length} 集是正本沒有的：` +
          `${orphan.join('、')}。\n` +
          'public/ 是正本的複本，不可以直接編輯。' +
          '如果這幾集是真的要上架，請把它們加進根目錄的 feed_podcast_show.xml。'
      );
    }

    // ── (d) 正本不可以比現有的 public/ 少 ───────────────────
    if (rootItems.length < publicItems.length) {
      throw new FeedRuleError(
        `正本只有 ${rootItems.length} 集，比現有的 public/（${publicItems.length} 集）還少。` +
          '這代表正本可能被整檔覆蓋寫壞了，拒絕用它覆蓋 public/。'
      );
    }
  }

  // ── 通過檢查：public/ 就是正本的複本 ─────────────────────
  fs.mkdirSync(path.dirname(PUBLIC_FEED_PATH), { recursive: true });
  fs.writeFileSync(PUBLIC_FEED_PATH, rootContent, 'utf8');
  console.log(
    `✅ 訂閱源規則檢查通過：正本 ${rootItems.length} 集、封面 ${images.length} 處都對，` +
      `public/ 已同步成正本的複本${publicExists ? '' : '（原本不存在，已建立）'}。`
  );
  return { count: rootItems.length, created: !publicExists };
}

export { FeedRuleError };
