import { useState } from 'react';
import { LegalModal } from './LegalModal';

export function Footer({ title }: { title: string }) {
  const [modalType, setModalType] = useState<'terms' | 'privacy' | 'archive' | null>(null);

  const legalContent = {
    terms: (
      <>
        <p>歡迎使用 {title}（以下簡稱「本網站」）。請仔細閱讀以下服務條款。使用本網站即表示您同意受這些條款的約束。</p>
        <h3 className="font-bold text-on-surface mt-4">1. 內容使用</h3>
        <p>本網站提供的所有播客音訊、文字描述及地圖資訊僅供個人非商業用途。未經授權，請勿轉載或用於商業行為。</p>
        <h3 className="font-bold text-on-surface mt-4">2. 免責聲明</h3>
        <p>本網站的資訊與內容皆為一般性參考，我們盡力確保內容的正確性，但不對任何特定目的之適用性提供任何明示或暗示的保證。</p>
        <h3 className="font-bold text-on-surface mt-4">3. 留言區規範</h3>
        <p>使用者應對其留言負責，請勿發表任何具攻擊性、歧視性、誹謗性或違法的言論。我們保留隨時刪除不當留言之權利。</p>
        <h3 className="font-bold text-on-surface mt-4">4. 條款修改</h3>
        <p>我們保留隨時修改本服務條款的權利。修改後的條款將於本網站發布後立即生效。</p>
      </>
    ),
    privacy: (
      <>
        <p>我們非常重視您的隱私權。本隱私政策說明了我們如何收集、使用和保護您的個人資料。</p>
        <h3 className="font-bold text-on-surface mt-4">1. 資料收集</h3>
        <p>當您使用留言功能時，我們可能會透過 Google 登入收集您的公開個人檔案資訊（如姓名與電子郵件）以顯示於留言板上。</p>
        <h3 className="font-bold text-on-surface mt-4">2. 資料使用</h3>
        <p>收集之資料僅用於維護網站互動與留言區的運作，我們不會將您的個人資訊出售或未經同意提供給第三方。</p>
        <h3 className="font-bold text-on-surface mt-4">3. 資料安全</h3>
        <p>我們採取合理的安全措施來保護您的資訊免於未經授權的存取。但請注意，網際網路傳輸無法保證 100% 的安全性。</p>
      </>
    ),
    archive: (
      <>
        <p>關於本網站內容之存檔與版權說明：</p>
        <h3 className="font-bold text-on-surface mt-4">1. 內容歸屬</h3>
        <p>本網站所有的播客音訊檔案、原創文本及相關素材之著作權皆屬於 {title} 團隊或原作者所有。</p>
        <h3 className="font-bold text-on-surface mt-4">2. 第三方平台</h3>
        <p>部分音訊檔案可能託管於如 Internet Archive 等第三方存檔平台，其使用規範亦受該平台之條款約束。</p>
        <h3 className="font-bold text-on-surface mt-4">3. 授權與引用</h3>
        <p>若您希望引用本網站之內容，請務必標明出處並附上本網站連結。如有商業合作或授權需求，請透過聯絡我們進行洽詢。</p>
      </>
    )
  };

  return (
    <>
      <section className="py-16 md:py-32 bg-primary text-on-primary text-center">
        <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 className="font-headline-lg text-4xl mb-4">跟隨 Co哥 探索不凡。</h2>
          <p className="font-body-lg text-lg text-primary-fixed-dim mb-8 max-w-xl mx-auto">
            與我們一起踏上跨文化的旅程，每週發掘世界各個角落的真實故事與人文感動。
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="https://podcasts.apple.com/us/podcast/co哥世界人文探索/id6785083100" 
              className="bg-[#ffffff] text-[#000] flex items-center justify-center gap-3 px-8 py-3 rounded-full hover:bg-surface-container-high transition-all"
            >
              <span className="font-label-md text-sm">Apple 播客</span>
            </a>
            <a 
              href="https://open.spotify.com/show/033FOyK9pRonzKlLRxqi17?si=thEIA2kSQwaXSvrZ_svGAA" 
              className="bg-[#1DB954] text-white flex items-center justify-center gap-3 px-8 py-3 rounded-full hover:opacity-90 transition-all"
            >
              <span className="font-label-md text-sm">Spotify</span>
            </a>
            <a 
              href="https://coolai-studio.github.io/coge-podcast/feed_podcast_show.xml" 
              className="bg-primary-container border border-primary-fixed text-on-primary-container flex items-center justify-center gap-3 px-8 py-3 rounded-full hover:bg-primary transition-all"
            >
              <span className="font-label-md text-sm">RSS 訂閱源</span>
            </a>
          </div>
        </div>
      </section>

      <footer id="footer" className="w-full bg-surface-container-highest border-t border-outline/5">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[var(--spacing-container-max)] mx-auto px-margin-mobile md:px-margin-desktop py-16">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <a href="#" className="font-headline-sm text-2xl text-secondary block mb-2">{title}</a>
            <p className="font-label-md text-sm text-on-tertiary-fixed-variant max-w-xs">© 2026 {title}。版權所有，保留一切權利。</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-label-md text-sm">
            <button onClick={() => setModalType('terms')} className="text-on-tertiary-fixed-variant hover:text-primary transition-colors cursor-pointer">服務條款</button>
            <button onClick={() => setModalType('privacy')} className="text-on-tertiary-fixed-variant hover:text-primary transition-colors cursor-pointer">隱私政策</button>
            <button onClick={() => setModalType('archive')} className="text-on-tertiary-fixed-variant hover:text-primary transition-colors cursor-pointer">存檔權利</button>
            <a href="mailto:coolaistudio@gmail.com" className="text-on-tertiary-fixed-variant hover:text-primary transition-colors">聯絡我們</a>
          </div>
        </div>
      </footer>

      {modalType === 'terms' && (
        <LegalModal title="服務條款" content={legalContent.terms} onClose={() => setModalType(null)} />
      )}
      {modalType === 'privacy' && (
        <LegalModal title="隱私政策" content={legalContent.privacy} onClose={() => setModalType(null)} />
      )}
      {modalType === 'archive' && (
        <LegalModal title="存檔權利" content={legalContent.archive} onClose={() => setModalType(null)} />
      )}
    </>
  );
}
