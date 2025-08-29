import { chromium, Browser, Page } from 'playwright';
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
      console.log('🚀 Initializing Playwright browser...');
      
      // Special configuration for cloud environments
      const launchOptions: any = {
        headless: this.config.headless ?? true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      };

      // For Replit/cloud environments
      if (process.env.REPL_ID || process.env.REPLIT_DB_URL) {
        console.log('🌐 Detected Replit environment, adjusting browser settings...');
        launchOptions.args.push('--single-process');
      }

      this.browser = await chromium.launch(launchOptions);

      this.page = await this.browser.newPage();
      await this.page.setViewportSize({
        width: this.config.viewportWidth ?? 1920,
        height: this.config.viewportHeight ?? 1080,
      });

      await this.page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      console.log('✅ Browser initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing browser:', error);
      throw error;
    }
  }

  async navigateToWebsite(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized. Call initialize() first.');

    try {
      console.log(`🌐 Navigating to: ${this.config.targetUrl}`);
      
      await this.page.goto(this.config.targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: this.config.pageLoadTimeout || 60000,
      });

      try {
        await this.page.waitForLoadState('networkidle', { 
          timeout: this.config.networkIdleTimeout || 15000 
        });
        console.log('✅ Network idle state achieved');
      } catch {
        console.log('⚠️  Network still active, proceeding anyway...');
      }

      console.log('✅ Successfully navigated to target website');
    } catch (error) {
      console.error('❌ Error navigating to website:', error);
      throw error;
    }
  }

  async clickTargetButton(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized. Call initialize() first.');

    const buttonSelector = this.config.buttonSelector || '.storechat-button';

    try {
      console.log(`🔍 Looking for button: ${buttonSelector}...`);

      const buttonFound = await this.page.waitForSelector(buttonSelector, {
        timeout: this.config.buttonWaitTimeout || 15000,
        state: 'visible'
      }).catch(() => null);

      if (!buttonFound) {
        const pageTitle = await this.page.title();
        const currentUrl = this.page.url();
        throw new Error(`Button "${buttonSelector}" not found on page "${pageTitle}" (${currentUrl}). Please verify the button exists and selector is correct.`);
      }

      if (this.config.waitBeforeClick) {
        await this.page.waitForTimeout(this.config.waitBeforeClick);
      }

      console.log(`👆 Clicking on ${buttonSelector}...`);

      await this.page.evaluate((selector) => {
        const buttons = document.querySelectorAll(selector);
        let clicked = false;
        
        buttons.forEach((button: Element) => {
          if (!clicked) {
            const element = button as HTMLElement;
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            
            if (style.display !== 'none' && 
                style.visibility !== 'hidden' && 
                style.opacity !== '0' &&
                rect.width > 0 && 
                rect.height > 0) {
              
              try {
                element.click();
                clicked = true;
              } catch {
                try {
                  element.dispatchEvent(new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                  }));
                  clicked = true;
                } catch {
                  const event = new Event('click', { bubbles: true });
                  element.dispatchEvent(event);
                  clicked = true;
                }
              }
            }
          }
        });
        
        return clicked;
      }, buttonSelector);

      console.log('⏳ Waiting for chatbox to appear...');
      
      const chatboxSelectors = ['.storechat-widget', '#storechat-container', '.storechat-modal'];
      let chatboxFound = false;
      
      for (const selector of chatboxSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
          console.log(`✅ Chatbox found with selector: ${selector}`);
          chatboxFound = true;
          break;
        } catch {
          continue;
        }
      }

      if (!chatboxFound) {
        console.log('⚠️  No chatbox detected immediately, continuing...');
      }

      if (this.config.waitAfterClick) {
        await this.page.waitForTimeout(this.config.waitAfterClick);
      }

      console.log(`✅ Successfully clicked ${buttonSelector} and widget opened`);
    } catch (error) {
      console.error(`❌ Error clicking ${buttonSelector}:`, error);
      throw new Error(`Failed to click ${buttonSelector}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeModalsAndPopups(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized. Call initialize() first.');

    try {
      console.log('🧹 Removing modals and popups...');

      await this.page.addStyleTag({
        content: `
          .modal, .popup, .overlay, .newsletter-popup,
          .promo-banner, .promotion-bar, .cookie-banner,
          .exit-intent, .email-signup, .discount-popup,
          [class*="modal"], [class*="popup"], [class*="overlay"],
          [id*="modal"], [id*="popup"], [id*="overlay"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
        `
      });

      await this.page.evaluate(() => {
        const closeButtons = document.querySelectorAll([
          '.close', '.modal-close', '.popup-close', 
          '[aria-label="close"]', '[aria-label="Close"]'
        ].join(','));

        closeButtons.forEach((button: Element) => {
          if (button instanceof HTMLElement) {
            button.click();
          }
        });
      });

      await this.page.waitForTimeout(2000);
      console.log('✅ Modal/popup removal completed');
    } catch (error) {
      console.error('⚠️  Error removing modals:', error);
    }
  }

  async injectCustomCSS(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized. Call initialize() first.');

    if (!this.config.customCSS) {
      console.log('🎨 Injecting custom CSS for storechat-button...');
      await this.page.addStyleTag({
        content: '.storechat-button { background: red !important; }'
      });
    } else {
      console.log('🎨 Injecting custom CSS...');
      console.log('📝 CSS:', this.config.customCSS.substring(0, 100) + '...');
      
      await this.page.addStyleTag({
        content: this.config.customCSS
      });
    }

    console.log('✅ Custom CSS injected successfully');
  }

  async takeScreenshot(filename: string): Promise<Buffer> {
    if (!this.page) throw new Error('Browser not initialized. Call initialize() first.');

    try {
      console.log(`📸 Taking screenshot: ${filename}`);
      
      if (this.config.waitBeforeScreenshot) {
        await this.page.waitForTimeout(this.config.waitBeforeScreenshot);
      }

      let screenshotBuffer: Buffer;

      if (this.config.zoomSelector) {
        console.log(`🔍 Looking for element to screenshot: ${this.config.zoomSelector}`);
        
        try {
          const element = await this.page.waitForSelector(this.config.zoomSelector, {
            timeout: 5000,
            state: 'visible'
          });

          if (element) {
            const elementInfo = await this.page.evaluate((selector) => {
              const el = document.querySelector(selector);
              if (!el) return { found: false };
              
              const rect = el.getBoundingClientRect();
              const style = window.getComputedStyle(el);
              
              return {
                selector,
                found: true,
                visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
                dimensions: { width: rect.width, height: rect.height },
                position: { top: rect.top, left: rect.left }
              };
            }, this.config.zoomSelector);

            console.log('📊 Element info:', elementInfo);

            if (elementInfo.visible && elementInfo.dimensions.width > 0 && elementInfo.dimensions.height > 0) {
              if (this.config.zoomLevel && this.config.zoomLevel !== 1) {
                const zoomPercent = Math.round(this.config.zoomLevel * 100);
                console.log(`🔍 Applying ${zoomPercent}% zoom...`);
                
                await this.page.evaluate((args) => {
                  const { selector, zoom } = args;
                  const element = document.querySelector(selector);
                  if (element && element instanceof HTMLElement) {
                    element.style.transform = `scale(${zoom})`;
                    element.style.transformOrigin = 'top left';
                  }
                }, { selector: this.config.zoomSelector, zoom: this.config.zoomLevel });

                await this.page.waitForTimeout(1000);
              }

              screenshotBuffer = await element.screenshot({
                quality: this.config.screenshotQuality || 90,
                type: this.config.screenshotFormat || 'png'
              });

              console.log(`✅ Zoomed screenshot of ${this.config.zoomSelector} captured`);
            } else {
              console.log(`⚠️  Could not zoom on ${this.config.zoomSelector}, taking full page screenshot`);
              screenshotBuffer = await this.page.screenshot({
                fullPage: this.config.fullPageScreenshot !== false,
                quality: this.config.screenshotQuality || 90,
                type: this.config.screenshotFormat || 'png'
              });
            }
          } else {
            throw new Error('Element not found');
          }
        } catch (error) {
          console.log(`⚠️  Could not find/screenshot ${this.config.zoomSelector}, taking full page screenshot`);
          screenshotBuffer = await this.page.screenshot({
            fullPage: this.config.fullPageScreenshot !== false,
            quality: this.config.screenshotQuality || 90,
            type: this.config.screenshotFormat || 'png'
          });
        }
      } else {
        screenshotBuffer = await this.page.screenshot({
          fullPage: this.config.fullPageScreenshot !== false,
          quality: this.config.screenshotQuality || 90,
          type: this.config.screenshotFormat || 'png'
        });
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
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        console.log('🧹 Browser cleanup completed');
      }
    } catch (error) {
      console.error('⚠️  Error during cleanup:', error);
    }
  }
}