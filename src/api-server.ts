import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
// Use Puppeteer for Replit compatibility
import { ConviCrawler } from './crawler-puppeteer';
import { CrawlerConfig } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'convi-crawler-api' 
  });
});

// Simple test endpoint for browser testing
app.get('/api/test', (req, res) => {
  res.json({
    message: '🎉 API is working!',
    endpoints: {
      health: 'GET /health',
      crawl: 'POST /api/crawl',
      batch: 'POST /api/crawl-batch'
    },
    example: {
      method: 'POST',
      url: '/api/crawl',
      body: {
        websiteUrl: 'https://bearshop-product.myshopify.com',
        options: {
          buttonSelector: '.storechat-button',
          zoomSelector: '.storechat-widget',
          zoomLevel: 0.9,
          customCSS: '#storechat-container .storechat-header{background-color: #FF0000 !important;}'
        }
      }
    }
  });
});

// Main crawler endpoint for n8n integration
app.post('/api/crawl', async (req, res) => {
  try {
    console.log('📨 Received crawl request:', req.body);

    // Extract website URL from request
    const { websiteUrl, options = {} } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({
        error: 'Missing websiteUrl parameter',
        message: 'Please provide a websiteUrl in the request body'
      });
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid URL (e.g., https://example.com)'
      });
    }

    // Create crawler configuration
    const config: CrawlerConfig = {
      targetUrl: websiteUrl,
      imgbbApiKey: process.env.IMGBB_API_KEY!,
      n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:3000/dummy', // Not needed for API mode
      waitBeforeClick: options.waitBeforeClick || parseInt(process.env.WAIT_BEFORE_CLICK || '2000'),
      waitAfterClick: options.waitAfterClick || parseInt(process.env.WAIT_AFTER_CLICK || '3000'),
      waitBeforeScreenshot: options.waitBeforeScreenshot || parseInt(process.env.WAIT_BEFORE_SCREENSHOT || '1000'),
      pageLoadTimeout: options.pageLoadTimeout || parseInt(process.env.PAGE_LOAD_TIMEOUT || '60000'),
      networkIdleTimeout: options.networkIdleTimeout || parseInt(process.env.NETWORK_IDLE_TIMEOUT || '15000'),
      buttonWaitTimeout: options.buttonWaitTimeout || parseInt(process.env.BUTTON_WAIT_TIMEOUT || '15000'),
      screenshotQuality: options.screenshotQuality || parseInt(process.env.SCREENSHOT_QUALITY || '90'),
      screenshotFormat: options.screenshotFormat || (process.env.SCREENSHOT_FORMAT as 'png' | 'jpeg') || 'png',
      headless: options.headless !== undefined ? options.headless : (process.env.HEADLESS !== 'false'),
      viewportWidth: options.viewportWidth || parseInt(process.env.VIEWPORT_WIDTH || '1920'),
      viewportHeight: options.viewportHeight || parseInt(process.env.VIEWPORT_HEIGHT || '1080'),
      customCSS: options.customCSS, // Custom CSS from n8n
      zoomSelector: options.zoomSelector, // Element to zoom on
      removeModals: options.removeModals !== false, // Default true
      fullPageScreenshot: options.fullPageScreenshot, // Full page or zoomed element
      buttonSelector: options.buttonSelector, // Dynamic button selector
      zoomLevel: options.zoomLevel, // Zoom percentage (0.5 = 50%, 1.5 = 150%)
    };

    // Validate required environment variables
    if (!config.imgbbApiKey) {
      return res.status(500).json({
        error: 'Missing ImgBB API key',
        message: 'Please set IMGBB_API_KEY in environment variables'
      });
    }

    console.log(`🎯 Starting crawl for: ${websiteUrl}`);

    // Run the crawler
    const crawler = new ConviCrawler(config);
    
    // Modified run method that doesn't use n8n webhook
    await crawler.initialize();
    await crawler.navigateToWebsite(websiteUrl);
    await crawler.clickTargetButton();

    // Remove modals/popups if requested
    if (config.removeModals !== false) {
      await crawler.removeModalsAndPopups();
      // Wait for page to settle after removing modals
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Take before screenshot
    console.log('📸 Taking BEFORE screenshot...');
    const beforeBuffer = await crawler.takeScreenshot('before-screenshot');
    const beforeUrl = await crawler['imgbbService'].uploadImage(
      beforeBuffer, 
      `convi-before-${Date.now()}`
    );

    // Apply CSS and take after screenshot  
    console.log('🎨 Applying custom CSS...');
    await crawler.injectCustomCSS(config.customCSS || '');

    console.log('📸 Taking AFTER screenshot...');
    const afterBuffer = await crawler.takeScreenshot('after-screenshot');
    const afterUrl = await crawler['imgbbService'].uploadImage(
      afterBuffer, 
      `convi-after-${Date.now()}`
    );

    await crawler.cleanup();

    // Return the results
    const result = {
      success: true,
      data: {
        websiteUrl,
        beforeScreenshotUrl: beforeUrl,
        afterScreenshotUrl: afterUrl,
        timestamp: new Date().toISOString(),
        processingTime: new Date().toISOString()
      },
      message: 'Screenshots captured and uploaded successfully'
    };

    console.log('🎉 Crawl completed successfully!');
    console.log(`📊 Results: ${JSON.stringify(result.data, null, 2)}`);

    res.json(result);

  } catch (error) {
    console.error('❌ Crawl failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: 'Crawl failed',
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Batch crawl endpoint (for multiple websites)
app.post('/api/crawl-batch', async (req, res) => {
  try {
    const { websiteUrls, options = {} } = req.body;

    if (!Array.isArray(websiteUrls) || websiteUrls.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid websiteUrls parameter',
        message: 'Please provide an array of website URLs'
      });
    }

    console.log(`🔄 Starting batch crawl for ${websiteUrls.length} websites...`);

    const results = [];
    
    // Process websites sequentially to avoid overwhelming resources
    for (let i = 0; i < websiteUrls.length; i++) {
      const websiteUrl = websiteUrls[i];
      console.log(`📍 Processing ${i + 1}/${websiteUrls.length}: ${websiteUrl}`);
      
      try {
        // Make request to single crawl endpoint
        const response = await axios.post(`http://localhost:${PORT}/api/crawl`, {
          websiteUrl,
          options
        });
        
        results.push(response.data);
      } catch (error) {
        console.error(`❌ Failed to crawl ${websiteUrl}:`, error);
        results.push({
          success: false,
          websiteUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      totalProcessed: results.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Batch crawl failed:', error);
    res.status(500).json({
      success: false,
      error: 'Batch crawl failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Convi Crawler API Server Started');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log('🔗 API Endpoints:');
  console.log(`   • Health Check: GET  http://localhost:${PORT}/health`);
  console.log(`   • Single Crawl:  POST http://localhost:${PORT}/api/crawl`);
  console.log(`   • Batch Crawl:   POST http://localhost:${PORT}/api/crawl-batch`);
  console.log('');
  console.log('📨 Example request:');
  console.log(`curl -X POST http://localhost:${PORT}/api/crawl \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"websiteUrl": "https://example.com"}\'');
  console.log('');
  console.log('🔧 Ready for n8n integration!');
});

export default app;
