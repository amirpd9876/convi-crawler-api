import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { ConviCrawler } from '../dist/crawler';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'convi-crawler-api-vercel',
        environment: 'production'
    });
});

// Main crawler endpoint
app.post('/api/crawl', async (req, res) => {
    try {
        console.log('📨 Received crawl request:', req.body);
        
        // Extract website URL from request
        const { websiteUrl, options = {} } = req.body;
        
        if (!websiteUrl) {
            return res.status(400).json({
                success: false,
                error: 'Missing websiteUrl parameter',
                message: 'Please provide a websiteUrl in the request body'
            });
        }
        
        // Validate URL format
        try {
            new URL(websiteUrl);
        } catch {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format',
                message: 'Please provide a valid URL (e.g., https://example.com)'
            });
        }
        
        // Create crawler configuration
        const config = {
            targetUrl: websiteUrl,
            imgbbApiKey: process.env.IMGBB_API_KEY || '9c4c485b1b1a33b4fff5eabe1cfc64e0',
            n8nWebhookUrl: 'http://localhost:3000/dummy', // Not needed for API mode
            waitBeforeClick: options.waitBeforeClick || 2000,
            waitAfterClick: options.waitAfterClick || 3000,
            waitBeforeScreenshot: options.waitBeforeScreenshot || 1000,
            pageLoadTimeout: options.pageLoadTimeout || 60000,
            networkIdleTimeout: options.networkIdleTimeout || 15000,
            buttonWaitTimeout: options.buttonWaitTimeout || 15000,
            screenshotQuality: options.screenshotQuality || 90,
            screenshotFormat: options.screenshotFormat || 'png',
            headless: options.headless !== false,
            viewportWidth: options.viewportWidth || 1920,
            viewportHeight: options.viewportHeight || 1080,
            customCSS: options.customCSS,
            zoomSelector: options.zoomSelector,
            removeModals: options.removeModals !== false,
            fullPageScreenshot: options.fullPageScreenshot,
            buttonSelector: options.buttonSelector,
            zoomLevel: options.zoomLevel,
        };
        
        console.log(`🎯 Starting crawl for: ${websiteUrl}`);
        
        // Run the crawler
        const crawler = new ConviCrawler(config);
        
        // Initialize and run crawler
        await crawler.initialize();
        await crawler.navigateToWebsite();
        await crawler.clickTargetButton();
        
        // Remove modals/popups if requested
        if (config.removeModals !== false) {
            await crawler.removeModalsAndPopups();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Take before screenshot
        console.log('📸 Taking BEFORE screenshot...');
        const beforeBuffer = await crawler.takeScreenshot('before-screenshot');
        const beforeUrl = await crawler['imgbbService'].uploadImage(beforeBuffer, `convi-before-${Date.now()}`);
        
        // Apply CSS and take after screenshot  
        console.log('🎨 Applying custom CSS...');
        await crawler.injectCustomCSS();
        
        console.log('📸 Taking AFTER screenshot...');
        const afterBuffer = await crawler.takeScreenshot('after-screenshot');
        const afterUrl = await crawler['imgbbService'].uploadImage(afterBuffer, `convi-after-${Date.now()}`);
        
        // Cleanup
        await crawler.cleanup();
        
        // Return results
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
        console.log('📊 Results:', JSON.stringify(result.data, null, 2));
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Crawl failed:', error);
        res.status(500).json({
            success: false,
            error: 'Crawl failed',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
            timestamp: new Date().toISOString()
        });
    }
});

// Batch crawl endpoint  
app.post('/api/crawl-batch', async (req, res) => {
    try {
        const { websites = [] } = req.body;
        
        if (!Array.isArray(websites) || websites.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                message: 'Please provide an array of websites'
            });
        }
        
        const results = [];
        
        for (const site of websites) {
            try {
                // Process each website
                const websiteUrl = typeof site === 'string' ? site : site.url;
                const options = typeof site === 'object' ? site.options || {} : {};
                
                // Similar processing as single crawl...
                results.push({
                    websiteUrl,
                    status: 'success',
                    message: 'Batch processing not fully implemented'
                });
                    } catch (error) {
            results.push({
                websiteUrl: site,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        }
        
        res.json({
            success: true,
            results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Batch crawl failed:', error);
        res.status(500).json({
            success: false,
            error: 'Batch crawl failed',
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
    }
});

// Export for Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
    await new Promise((resolve, reject) => {
        app(req as any, res as any, (error: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(undefined);
            }
        });
    });
};
