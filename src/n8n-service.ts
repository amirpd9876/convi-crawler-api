import axios from 'axios';

export interface N8NPayload {
  websiteUrl: string;
  beforeScreenshotUrl: string;
  afterScreenshotUrl: string;
  timestamp: string;
  processingTime?: string;
}

export class N8NService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendResults(payload: N8NPayload): Promise<void> {
    if (!this.webhookUrl || this.webhookUrl === 'http://localhost:3000/dummy') {
      console.log('📨 N8N webhook URL not configured, skipping...');
      return;
    }

    try {
      console.log(`📨 Sending results to n8n: ${this.webhookUrl}`);
      
      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('✅ Results sent to n8n successfully');
      console.log('📊 N8N Response:', response.status);
    } catch (error) {
      console.error('❌ Error sending results to n8n:', error);
      throw error;
    }
  }
}
