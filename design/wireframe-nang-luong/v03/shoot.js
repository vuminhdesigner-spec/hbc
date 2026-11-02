// Chụp màn wireframe 1440×900 cho trang so sánh. Chạy trong thư mục này khi đã mở `python3 -m http.server 8765`:
//   node shoot.js nuoc-v03=board=Nuoc nuoc-v03-ca=board=Nuoc&ca=1 nuoc-v03-cb=board=CanBang
// Mỗi tham số: <tên ảnh>=<query của preview.html>; ?ca=1 bật chế độ Ca. Không dùng `chromium --screenshot` (lệch khung).
const { chromium } = require(process.env.HOME + '/.npm/_npx/bbb8a2c4738e2b0c/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium-1148/chrome-mac/Chromium.app/Contents/MacOS/Chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  for (const a of process.argv.slice(2)) {
    const i = a.indexOf('='), f = a.slice(0, i), q = a.slice(i + 1);
    await p.goto('http://localhost:8765/preview.html?' + q); await p.waitForTimeout(2500);
    await p.screenshot({ path: f + '.png' });
  }
  await b.close();
})();
