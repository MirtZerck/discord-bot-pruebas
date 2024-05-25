class MusicQueue {
    private queues: Map<string, { url: string, title: string }[]>;

    constructor() {
        this.queues = new Map(); // Almacena colas por cada servidor
    }

    getQueue(guildId: string): { url: string, title: string }[] {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, []);
        }
        return this.queues.get(guildId)!;
    }

    addSong(guildId: string, song: { url: string, title: string }) {
        const queue = this.getQueue(guildId);
        queue.push(song);
    }

    getNextSong(guildId: string): { url: string, title: string } | undefined {
        const queue = this.getQueue(guildId);
        return queue.shift(); // Remueve y retorna la primera canción de la cola
    }

    hasSongs(guildId: string): boolean {
        const queue = this.getQueue(guildId);
        return queue.length > 0;
    }

    clearQueue(guildId: string) {
        this.queues.set(guildId, []);
    }
}

const musicQueue = new MusicQueue();
export { musicQueue };