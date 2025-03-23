import { Playlist } from "@/core/entities/Playlist";
import { SongNode } from "@/core/entities/SongNode";
import { IPersistence } from "@/core/ports/IPersistence";

/**
 * Decorador que añade persistencia automatica a la lista de reproducción
 */
export class PersistentPlaylist implements Playlist {
    head: SongNode | null = null;
    tail: SongNode | null = null;
    current: SongNode | null = null;
    length: number = 0;

    constructor(private playlist: Playlist, private persistence: IPersistence) {
        this.head = playlist.head;
        this.tail = playlist.tail;
        this.current = playlist.current;
        this.length = playlist.length;
    }

    private async persist(): Promise<void> {
        this.head = this.playlist.head;
        this.tail = this.playlist.tail;
        this.current = this.playlist.current;
        this.length = this.playlist.length;
        
        await this.persistence.savePlaylist(this.playlist);
    }

    isEmpty(): boolean {
        return this.playlist.isEmpty();
    }

    async addToStart(node: SongNode): Promise <void> {
        this.playlist.addToStart(node);
        await this.persist();
    }

    async addToEnd(node: SongNode): Promise <void> {
        this.playlist.addToEnd(node);
        await this.persist();
    }

    removeById(id: string): boolean {
        const result = this.playlist.removeById(id);
        this.persist();
        return result;
    }

    next(): SongNode | null {
        const result = this.playlist.next();
        this.persist();
        return result;
    }

    prev(): SongNode | null {
        const result = this.playlist.next();
        this.persist();
        return result;  
    }

    previus(): SongNode | null {
        const result = this.playlist.previus();
        this.persist();
        return result;
    }

    getAll(): SongNode[] {
        return this.playlist.getAll();
    }

    toJson(): any {
        return this.playlist.toJson();
    }


}