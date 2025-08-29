import axios from 'axios';
import FormData from 'form-data';

export class ImgBBService {
  private apiKey: string;
  private apiUrl = 'https://api.imgbb.com/1/upload';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
    try {
      const form = new FormData();
      form.append('key', this.apiKey);
      form.append('image', imageBuffer.toString('base64'));
      form.append('name', filename);

      console.log(`📤 Uploading image: ${filename}...`);

      const response = await axios.post(this.apiUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 30000,
      });

      if (response.data && response.data.success) {
        const imageUrl = response.data.data.url;
        console.log(`✅ Image uploaded successfully: ${response.data.data.title}`);
        console.log(`🔗 Image URL: ${imageUrl}`);
        return imageUrl;
      } else {
        throw new Error('Upload failed: ' + JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('❌ Error uploading image to ImgBB:', error);
      throw error;
    }
  }
}