import { chromium } from 'playwright';

// Get token using Node.js fetch
const loginRes = await fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '13800138000', password: '123456' })
});
const loginData = await loginRes.json();
const token = loginData?.data?.token;
console.log('Token obtained:', token ? 'yes' : 'no');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// Capture console errors
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});
page.on('pageerror', err => {
  consoleErrors.push('PAGE ERROR: ' + err.message);
});

// Navigate to login page first, set token, reload
await page.goto('http://localhost:3000/login');
await page.waitForTimeout(500);

await page.evaluate((t) => {
  localStorage.setItem('token', t);
}, token);

await page.reload();
await page.waitForTimeout(2000);

console.log('After reload URL:', page.url());

// Click "新建工作流" button
try {
  const newWorkflowBtn = page.locator('button:has-text("新建工作流")').first();
  await newWorkflowBtn.click();
  await page.waitForTimeout(3000);
  console.log('Editor URL:', page.url());
} catch (e) {
  console.log('Could not find 新建工作流 button:', e.message);
}

// Take screenshot 1
await page.screenshot({ path: '/tmp/screenshot-1-editor.png' });

// Click nodes button using data-test-id selector
console.log('\n--- Opening NodeLibrary ---');
try {
  const nodesBtn = page.locator('[data-test-id="nodes"]');
  await nodesBtn.click();
  console.log('Nodes button clicked (by data-test-id)');
} catch (e) {
  console.log('Could not find nodes button:', e.message);
}
await page.waitForTimeout(2000);

// Take screenshot 2
await page.screenshot({ path: '/tmp/screenshot-2-library.png' });

// Check if NodeLibrary panel is open
const libraryVisible = await page.locator('text=节点库').isVisible().catch(() => false);
console.log('NodeLibrary "节点库" visible:', libraryVisible);

// Check for AI绘图 in NodeLibrary
const aiImageCount = await page.locator('text=AI绘图').count();
console.log('AI绘图 count in DOM:', aiImageCount);

// Check for other nodes
const llmCount = await page.locator('text=LLM 调用').count();
console.log('LLM 调用 count:', llmCount);

const imgGenCount = await page.locator('text=图片生成').count();
console.log('图片生成 count:', imgGenCount);

// Check console errors
console.log('\nConsole errors:', consoleErrors.length > 0 ? consoleErrors : 'none');

// Test right-click context menu
console.log('\n--- Testing right-click context menu ---');
await page.mouse.click(600, 400, { button: 'right' });
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/screenshot-3-context-menu.png' });

const ctxMenuVisible = await page.locator('text=添加节点').isVisible().catch(() => false);
console.log('Context menu "添加节点" visible:', ctxMenuVisible);

if (ctxMenuVisible) {
  const ctxAiImage = await page.locator('text=AI绘图').count();
  console.log('AI绘图 in context menu:', ctxAiImage > 0);
}

// Close context menu
await page.mouse.click(600, 400);
await page.waitForTimeout(500);

console.log('\nAll screenshots saved to /tmp/screenshot-*.png');
await browser.close();
