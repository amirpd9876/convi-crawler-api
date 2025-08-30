import puppeteer, { Browser, Page } from 'puppeteer';
import { CrawlerConfig } from './types';
import { ImgBBService } from './imgbb-service';
import { N8NService } from './n8n-service';

export class ConviCrawler {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: CrawlerConfig;
  private imgbbService: ImgBBService;
  private n8nService: N8NService;

  constructor(config: CrawlerConfig) {
    this.config = config;
    this.imgbbService = new ImgBBService(config.imgbbApiKey);
    this.n8nService = new N8NService(config.n8nWebhookUrl);
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Puppeteer browser...');
      
      // Puppeteer configuration for Replit
      const launchOptions: any = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-extensions'
        ]
      };

      // For Replit environment - use system Chromium
      if (process.env.REPL_ID || process.env.REPLIT_DB_URL) {
        console.log('🌐 Detected Replit environment, using system Chromium...');
        // Try to find Chromium in common Replit/Nix locations
        const possiblePaths = [
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser',
          process.env.PUPPETEER_EXECUTABLE_PATH,
          '/nix/store/x205pbkd5xh5g4iv0g58xjla55has3cx-chromium-108.0.5359.94/bin/chromium-browser'
        ];
        
        for (const path of possiblePaths) {
          if (path && require('fs').existsSync(path)) {
            console.log(`✅ Found Chromium at: ${path}`);
            launchOptions.executablePath = path;
            break;
          }
        }
      }

      this.browser = await puppeteer.launch(launchOptions);
      this.page = await this.browser.newPage();
      
      await this.page.setViewport({
        width: this.config.viewportWidth ?? 1920,
        height: this.config.viewportHeight ?? 1080,
      });

      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      console.log('✅ Browser initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing browser:', error);
      throw error;
    }
  }

  async navigateToWebsite(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    try {
      console.log(`🌐 Navigating to: ${url}`);
      
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.config.pageLoadTimeout || 60000,
      });

      // Wait for network to settle
      try {
        await this.page.waitForLoadState?.('networkidle') || 
        await this.page.evaluate(() => new Promise(resolve => {
          if (document.readyState === 'complete') {
            setTimeout(resolve, 2000);
          } else {
            window.addEventListener('load', () => setTimeout(resolve, 2000));
          }
        }));
      } catch (e) {
        console.log('⚠️  Network still active, proceeding anyway...');
      }

      console.log('✅ Successfully navigated to target website');
    } catch (error) {
      console.error('❌ Error navigating to website:', error);
      throw error;
    }
  }

  async removeModalsAndPopups(): Promise<void> {
    if (!this.page) return;

    try {
      console.log('🧹 Removing modals and popups...');
      
      await this.page.evaluate(() => {
        const selectors = [
          '[class*="popup"]', '[class*="modal"]', '[class*="overlay"]',
          '[class*="banner"]', '[class*="cookie"]', '[class*="gdpr"]',
          '[class*="newsletter"]', '[class*="subscribe"]', '[class*="notification"]',
          '[id*="popup"]', '[id*="modal"]', '[id*="overlay"]',
          '[role="dialog"]', '[role="alertdialog"]', '.fancybox-overlay',
          '.modal-backdrop', '.modal-dialog', '.popup-overlay'
        ];

        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach((el: any) => {
            if (el && el.style) {
              el.style.display = 'none !important';
              el.style.visibility = 'hidden !important';
              el.style.opacity = '0 !important';
              el.remove();
            }
          });
        });

        document.body.style.overflow = 'auto !important';
        const htmlElement = document.querySelector('html');
        if (htmlElement) {
          htmlElement.style.overflow = 'auto !important';
        }
      });

      await this.page.waitForTimeout(2000);
      console.log('✅ Modals and popups removed');
    } catch (error) {
      console.log('⚠️  Could not remove all modals:', error);
    }
  }

  async clickTargetButton(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    const buttonSelector = this.config.buttonSelector || '.storechat-button';

    try {
      console.log(`🔍 Looking for button: ${buttonSelector}...`);

      const buttonFound = await this.page.waitForSelector(buttonSelector, {
        timeout: this.config.buttonWaitTimeout || 15000,
        visible: true
      }).catch(() => null);

      if (!buttonFound) {
        const pageTitle = await this.page.title();
        const currentUrl = this.page.url();
        throw new Error(`Button "${buttonSelector}" not found on page "${pageTitle}" (${currentUrl})`);
      }

      if (this.config.waitBeforeClick) {
        await this.page.waitForTimeout(this.config.waitBeforeClick);
      }

      console.log(`👆 Clicking on ${buttonSelector}...`);
      await this.page.click(buttonSelector);

      // Wait for chatbox to appear
      console.log('⏳ Waiting for chatbox to appear...');
      
      const chatSelectors = [
        '.storechat-widget',
        '#storechat-widget',
        '#storechat-container',
        '.storechat-container',
        '[class*="storechat"]',
        '[id*="storechat"]'
      ];

      let chatboxFound = false;
      for (const selector of chatSelectors) {
        try {
          await this.page.waitForSelector(selector, { 
            timeout: 5000,
            visible: true 
          });
          console.log(`✅ Chatbox found with selector: ${selector}`);
          chatboxFound = true;
          break;
        } catch {
          continue;
        }
      }

      if (!chatboxFound) {
        console.log('⚠️  Chatbox might not be fully visible, continuing anyway...');
      }

      if (this.config.waitAfterClick) {
        await this.page.waitForTimeout(this.config.waitAfterClick);
      }

      console.log(`✅ Successfully clicked ${buttonSelector} and widget opened`);
    } catch (error) {
      console.error(`❌ Error clicking ${buttonSelector}:`, error);
      throw new Error(`Failed to click ${buttonSelector}: ${error}`);
    }
  }

  async injectCustomCSS(css: string): Promise<void> {
    if (!this.page || !css) return;

    try {
      console.log('🎨 Injecting custom CSS...');
      console.log(`📝 CSS: ${css.substring(0, 100)}...`);
      
      await this.page.addStyleTag({ content: css });
      await this.page.waitForTimeout(1000);
      
      console.log('✅ Custom CSS injected successfully');
    } catch (error) {
      console.error('❌ Error injecting CSS:', error);
    }
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      console.log(`📸 Taking screenshot: ${name}`);

      if (this.config.waitBeforeScreenshot) {
        await this.page.waitForTimeout(this.config.waitBeforeScreenshot);
      }

      let screenshotBuffer: Buffer;

      if (this.config.zoomSelector && !this.config.fullPageScreenshot) {
        console.log(`🔍 Looking for element to screenshot: ${this.config.zoomSelector}`);
        
        try {
          const element = await this.page.$(this.config.zoomSelector);
          
          if (element) {
            if (this.config.zoomLevel && this.config.zoomLevel !== 1) {
              console.log(`🔍 Applying ${this.config.zoomLevel * 100}% zoom...`);
              await this.page.evaluate((selector: string, zoom: number) => {
                const el = document.querySelector(selector);
                if (el && el instanceof HTMLElement) {
                  el.style.transform = `scale(${zoom})`;
                  el.style.transformOrigin = 'top left';
                }
              }, this.config.zoomSelector, this.config.zoomLevel);
              await this.page.waitForTimeout(500);
            }

            screenshotBuffer = await element.screenshot({
              type: this.config.screenshotFormat || 'png',
              quality: this.config.screenshotQuality || 90,
            }) as Buffer;
            
            console.log(`✅ Zoomed screenshot of ${this.config.zoomSelector} captured`);
          } else {
            console.log(`⚠️  Could not find element ${this.config.zoomSelector}, taking full page screenshot`);
            screenshotBuffer = await this.page.screenshot({
              fullPage: true,
              type: this.config.screenshotFormat || 'png',
              quality: this.config.screenshotQuality || 90,
            }) as Buffer;
          }
        } catch (error) {
          console.log(`⚠️  Error with element screenshot, falling back to full page`);
          screenshotBuffer = await this.page.screenshot({
            fullPage: true,
            type: this.config.screenshotFormat || 'png',
            quality: this.config.screenshotQuality || 90,
          }) as Buffer;
        }
      } else {
        screenshotBuffer = await this.page.screenshot({
          fullPage: this.config.fullPageScreenshot ?? true,
          type: this.config.screenshotFormat || 'png',
          quality: this.config.screenshotQuality || 90,
        }) as Buffer;
      }

      console.log('✅ Screenshot captured successfully');
      return screenshotBuffer;
    } catch (error) {
      console.error('❌ Error taking screenshot:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      console.log('🧹 Browser cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  async run(): Promise<{ beforeScreenshotUrl: string; afterScreenshotUrl: string }> {
    try {
      await this.initialize();
      await this.navigateToWebsite(this.config.targetUrl);
      
      if (this.config.removeModals) {
        await this.removeModalsAndPopups();
      }

      await this.clickTargetButton();
      
      const beforeScreenshot = await this.takeScreenshot('before-screenshot');
      const beforeUrl = await this.imgbbService.uploadImage(
        beforeScreenshot,
        `convi-before-${Date.now()}.png`
      );

      if (this.config.customCSS) {
        await this.injectCustomCSS(this.config.customCSS);
      }

      const afterScreenshot = await this.takeScreenshot('after-screenshot');
      const afterUrl = await this.imgbbService.uploadImage(
        afterScreenshot,
        `convi-after-${Date.now()}.png`
      );

      const result = {
        websiteUrl: this.config.targetUrl,
        beforeScreenshotUrl: beforeUrl,
        afterScreenshotUrl: afterUrl,
        timestamp: new Date().toISOString(),
        processingTime: new Date().toISOString()
      };

      if (this.config.n8nWebhookUrl) {
        await this.n8nService.sendResults(result);
      }

      console.log('🎉 Crawl completed successfully!');
      console.log('📊 Results:', JSON.stringify(result, null, 2));

      return result;
    } finally {
      await this.cleanup();
    }
  }
}
