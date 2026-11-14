// Node.js script to capture screenshots using Puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const baseUrl = 'http://localhost:8080/test/test-whats-new-banner.html';
  
  console.log('Capturing screenshots...');
  
  // Desktop view
  console.log('1. Desktop view (1200x800)');
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.showNewBanner();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: '/opt/cursor/artifacts/whats-new-desktop.png',
    fullPage: false 
  });
  
  // Mobile view (390px)
  console.log('2. Mobile view (390x844)');
  await page.setViewport({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.showNewBanner();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: '/opt/cursor/artifacts/whats-new-mobile.png',
    fullPage: false 
  });
  
  // Banner dismissed on mobile
  console.log('3. Banner dismissed on mobile');
  await page.evaluate(() => {
    document.querySelector('.whats-new__got-it').click();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: '/opt/cursor/artifacts/whats-new-mobile-dismissed.png',
    fullPage: false 
  });
  
  await browser.close();
  console.log('Screenshots saved to /opt/cursor/artifacts/');
}

captureScreenshots().catch(console.error);
