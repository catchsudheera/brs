export interface Game {
  id: string;
  createdAt: Date;
  groups: {
    [groupName: string]: number[]; // player IDs
  };
}

export interface GameScore extends Game {
  isStarted?: boolean;
  scores: {
    [groupName: string]: {
      [matchIndex: number]: {
        team1Score: number;
        team2Score: number;
      };
    };
  };
}

class GameStorageService {
  private dbName = 'BadmintonGamesDB';
  private version = 1;
  private gamesStoreName = 'games';

  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.gamesStoreName)) {
          db.createObjectStore(this.gamesStoreName, { keyPath: 'id' });
        }
      };
    });
  }

  async createGame(groups: Record<string, number[]>): Promise<string> {
    const db = await this.initDB();
    const gameId = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.gamesStoreName], 'readwrite');
      const store = transaction.objectStore(this.gamesStoreName);

      const game: Game = {
        id: gameId,
        createdAt: new Date(),
        groups
      };

      const request = store.add(game);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(gameId);

      transaction.oncomplete = () => db.close();
    });
  }

  async getGame(gameId: string): Promise<GameScore | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.gamesStoreName], 'readonly');
      const store = transaction.objectStore(this.gamesStoreName);
      const request = store.get(gameId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);

      transaction.oncomplete = () => db.close();
    });
  }

  async updateGameScores(
    gameId: string,
    scores: GameScore['scores']
  ): Promise<void> {
    const db = await this.initDB();
    const game = await this.getGame(gameId);

    if (!game) throw new Error('Game not found');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.gamesStoreName], 'readwrite');
      const store = transaction.objectStore(this.gamesStoreName);

      const request = store.put({
        ...game,
        scores
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  }

  async updateGame(
    gameId: string,
    groups: Record<string, number[]>
  ): Promise<void> {
    const db = await this.initDB();
    const game = await this.getGame(gameId);

    if (!game) throw new Error('Game not found');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.gamesStoreName], 'readwrite');
      const store = transaction.objectStore(this.gamesStoreName);

      const request = store.put({
        ...game,
        groups,
        scores: {} // Reset scores when groups are updated
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  }

  async getAllGames(): Promise<GameScore[]> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.gamesStoreName], 'readonly');
      const store = transaction.objectStore(this.gamesStoreName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      transaction.oncomplete = () => db.close();
    });
  }

  async updateGameStarted(gameId: string, isStarted: boolean): Promise<void> {
    const db = await this.initDB();
    const game = await this.getGame(gameId);

    if (!game) throw new Error('Game not found');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.gamesStoreName], 'readwrite');
      const store = transaction.objectStore(this.gamesStoreName);

      const request = store.put({
        ...game,
        isStarted
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  }

  async deleteGame(gameId: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.gamesStoreName], 'readwrite');
      const store = transaction.objectStore(this.gamesStoreName);
      const request = store.delete(gameId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  }
}

export const gameStorageService = new GameStorageService(); 