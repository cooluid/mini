import Dexie from 'dexie';
import { MovieInfo } from '../../electron/types/index';

class MovieDatabase extends Dexie {
    movies!: Dexie.Table<MovieInfo, string>;

    constructor() {
        super('MovieDatabase');
        this.version(1).stores({
            movies: 'id, title'
        });
    }
}

let db = new MovieDatabase();

export class DatabaseService {
    private static instance: DatabaseService;

    private constructor() {
        this.setupIpcListeners();
    }

    private setupIpcListeners() {
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async saveMovie(movie: MovieInfo): Promise<void> {
        await db.movies.put(movie);
    }

    public async getMovie(id: string): Promise<MovieInfo | undefined> {
        const movie = await db.movies.get(id);
        return movie;
    }

    public async searchMovies(query: string): Promise<MovieInfo[]> {
        return db.movies.where('title').startsWithIgnoreCase(query).or('id').equals(query).toArray();
    }

    public async deleteMovie(id: string): Promise<void> {
        await db.movies.delete(id);
    }

    public async getAllMovies(): Promise<MovieInfo[]> {
        return db.movies.toArray();
    }

    public async updateMovie(movie: MovieInfo): Promise<void> {
        await db.movies.put(movie);
    }

    public async exportDatabase(): Promise<string> {
        const allMovies = await this.getAllMovies();
        return JSON.stringify(allMovies);
    }

    public async importDatabase(jsonData: string): Promise<void> {
        try {
            const movies = JSON.parse(jsonData) as MovieInfo[];
            await db.movies.clear();
            await db.movies.bulkAdd(movies);
        } catch (error) {
            throw error;
        }
    }

    private async ensureConnection() {
        if (!db.isOpen()) {
            try {
                await db.open();
            } catch (error) {
                throw error;
            }
        }
    }

    public async clear(): Promise<void> {
        try {
            await db.delete();
            // 重新初始化数据库
            db = new MovieDatabase();
            await this.ensureConnection();
        } catch (error) {
            throw error;
        }
    }

    public async getDatabaseStats(): Promise<{ movieCount: number; totalSize: number }> {
        try {
            await this.ensureConnection();
            const allMovies = await this.getAllMovies();
            const movieCount = allMovies.length;
            let totalSize = 0;
            return { movieCount, totalSize };

        } catch (error) {
            throw error;
        }
    }
}