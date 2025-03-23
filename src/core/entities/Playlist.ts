import { SongNode } from "./SongNode"; 

/**
 * Implementación de una lista doblemente enlazada para gestionar
 * la reproducción de canciones.
 */
export class Playlist {
    public head: SongNode | null = null;
    public tail: SongNode | null = null;
    public current: SongNode | null = null;
    public length: number = 0;

    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.length = 0;
    }

    /**
     * Verifica si la lista está vacía.
     */
    isEmpty(): boolean {
        return this.head === null;
    }

    /**
     * Agrega una canción al inicio de la lista.
     */
    addToStart(node: SongNode): void {
        if (this.isEmpty()) {
            this.head = node;
            this.tail = node;
            this.current = node;
        } else {
            node.next = this.head;
            this.head!.prev = node;
            this.head = node;
        }
        this.length++;
    }

    /**
     * Agrega una canción al final de la lista.
     */
    addToEnd(node: SongNode): void {
        if (this.isEmpty()){
            this.head = node;
            this.tail = node;
            this.current = node;
        } else {
            this.tail!.next = node;
            node.prev = this.tail;
            this.tail = node;
        }
    }
}