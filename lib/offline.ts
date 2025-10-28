export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private cache: Map<string, any> = new Map();
  private syncQueue: Array<{ url: string; data: any; method: string }> = [];

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      this.loadFromStorage();
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.syncPendingRequests();
  }

  private handleOffline() {
    this.isOnline = false;
  }

  async fetchWithCache(url: string, options?: RequestInit): Promise<any> {
    const cacheKey = `${url}_${JSON.stringify(options)}`;

    if (!this.isOnline) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      throw new Error('No cached data available offline');
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      // Cache successful GET requests
      if (!options?.method || options.method === 'GET') {
        this.cache.set(cacheKey, data);
        this.saveToStorage();
      }
      
      return data;
    } catch (error) {
      // Return cached data if available
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  async postWithSync(url: string, data: any): Promise<any> {
    if (!this.isOnline) {
      // Queue for later sync
      this.syncQueue.push({ url, data, method: 'POST' });
      this.saveToStorage();
      return { success: true, queued: true };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      // Queue for later sync
      this.syncQueue.push({ url, data, method: 'POST' });
      this.saveToStorage();
      throw error;
    }
  }

  private async syncPendingRequests() {
    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const request of queue) {
      try {
        await fetch(request.url, {
          method: request.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.data)
        });
      } catch (error) {
        // Re-queue failed requests
        this.syncQueue.push(request);
      }
    }

    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('offline_cache', JSON.stringify(Array.from(this.cache.entries())));
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('offline_cache');
      if (cachedData) {
        this.cache = new Map(JSON.parse(cachedData));
      }

      const queueData = localStorage.getItem('sync_queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  getPendingSync(): number {
    return this.syncQueue.length;
  }

  clearCache() {
    this.cache.clear();
    this.syncQueue = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('offline_cache');
      localStorage.removeItem('sync_queue');
    }
  }
}

// Utility functions for common offline operations
export const offlineManager = OfflineManager.getInstance();

export async function fetchSermons() {
  return offlineManager.fetchWithCache('/api/sermons');
}

export async function fetchEvents() {
  return offlineManager.fetchWithCache('/api/events');
}

export async function fetchAnnouncements() {
  return offlineManager.fetchWithCache('/api/announcements');
}

export async function submitPrayerRequest(data: any) {
  return offlineManager.postWithSync('/api/prayer', data);
}

export async function submitContactForm(data: any) {
  return offlineManager.postWithSync('/api/contact', data);
}