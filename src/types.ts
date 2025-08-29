export interface CrawlerConfig {
  targetUrl: string;
  imgbbApiKey: string;
  n8nWebhookUrl: string;
  waitBeforeClick?: number;
  waitAfterClick?: number;
  waitBeforeScreenshot?: number;
  pageLoadTimeout?: number;
  networkIdleTimeout?: number;
  buttonWaitTimeout?: number;
  screenshotQuality?: number;
  screenshotFormat?: 'png' | 'jpeg';
  headless?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  customCSS?: string;
  zoomSelector?: string;
  removeModals?: boolean;
  fullPageScreenshot?: boolean;
  buttonSelector?: string;
  zoomLevel?: number;
}

export interface ScreenshotResult {
  beforeScreenshotUrl: string;
  afterScreenshotUrl: string;
  websiteUrl: string;
  timestamp: string;
}