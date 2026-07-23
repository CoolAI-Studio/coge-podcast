export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden min-h-[700px] flex items-center bg-surface-container-low">
      <div 
        className="absolute inset-0 z-0 opacity-10 mix-blend-multiply" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8JHNEB4pVG8RX2DHdx6nA7lRVRHJHV6Yfwo4Pat1KH7qfYVwXk1SV1jtS2a_1uSiUeXwaHJDeuMCOk3LxDgWSqjVgrCxWtL45HIFhu8pXhqXA8vQDJ-eeRO-3oO96Cyi3D9RKFEgkD98OWXZ-LP4vs4Y1PLKZyIxi7TY1L3MqGM5EOnM2lWXHt_-9JiKxp_eBbmYxFaQcCOsVRyZx__kbHMJoiz2UMJchK-0gLEfcTo9N4lFMRzh8fN3z8S3qLjEt-bqhUGrlNBAU')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-mobile md:px-margin-desktop relative z-10 w-full text-center">
        <span className="font-label-md text-sm text-secondary tracking-widest uppercase mb-4 block">人類漫遊檔案館</span>
        <h1 className="font-display-lg text-5xl md:text-7xl text-on-surface mb-6 max-w-4xl mx-auto tracking-tight">聽見，世界的輪廓。</h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">這是一個深度探索全球歷史人文與傳奇故事的優質播客節目，帶您走遍世界各個角落，發掘最真實的在地文化與感動。每週定時更新，與您一起見證歷史的軌跡。</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            className="bg-secondary text-on-secondary px-8 py-3 font-label-md text-sm transition-all hover:scale-105"
            onClick={() => document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth' })}
          >
            最新集數
          </button>
          <button 
            className="border border-outline text-on-surface px-8 py-3 font-label-md text-sm transition-all hover:bg-surface-container-high"
            onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })}
          >
            探索地圖
          </button>
        </div>
      </div>
    </section>
  );
}
