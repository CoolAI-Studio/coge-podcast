const extractTheme = (description, title) => {
  const text = (title + ' ' + description).toLowerCase();
  if (text.match(/歷史|古蹟|殖民|古城|遺跡|傳奇/)) return 'historical_city';
  if (text.match(/度假|海灘|溫泉|海濱/)) return 'resort';
  if (text.match(/自然|秘境|森林|山脈|湖泊|國家公園|風景/)) return 'nature_secret';
  if (text.match(/現代|都會|商業|繁華|購物|摩天大樓|都會區/)) return 'modern_city';
  return 'general';
};
console.log(extractTheme("這是一個歷史悠久的古城", "【EP1】Test"));
