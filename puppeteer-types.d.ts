declare module 'puppeteer' {
  export interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }
  
  export interface Page {
    goto(url: string, options?: any): Promise<any>;
    setViewport(viewport: any): Promise<void>;
    setUserAgent(userAgent: string): Promise<void>;
    evaluate(fn: Function, ...args: any[]): Promise<any>;
    waitForSelector(selector: string, options?: any): Promise<any>;
    waitForTimeout(ms: number): Promise<void>;
    title(): Promise<string>;
    url(): string;
    click(selector: string): Promise<void>;
    addStyleTag(options: any): Promise<void>;
    $(selector: string): Promise<any>;
    screenshot(options?: any): Promise<Buffer>;
    close(): Promise<void>;
    waitForLoadState?(state: string): Promise<void>;
  }
  
  export function launch(options?: any): Promise<Browser>;
  
  const puppeteer: {
    launch: typeof launch;
  };
  
  export default puppeteer;
}
