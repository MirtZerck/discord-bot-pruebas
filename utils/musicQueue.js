class MusicQueue {
  constructor() {
    this.queues = new Map(); // Almacena colas por cada servidor
  }

  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, []);
    }
    return this.queues.get(guildId);
  }

  addSong(guildId, song) {
    const queue = this.getQueue(guildId);
    queue.push(song);
  }

  getNextSong(guildId) {
    const queue = this.getQueue(guildId);
    return queue.shift(); // Remueve y retorna la primera canción de la cola
  }

  hasSongs(guildId) {
    const queue = this.getQueue(guildId);
    return queue.length > 0;
  }

  clearQueue(guildId) {
    this.queues.set(guildId, []);
  }
}

const musicQueue = new MusicQueue();
export { musicQueue };
