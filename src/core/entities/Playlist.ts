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
        this.length++;
    }
    /**
     * Elimina la canción por su ID.
     */
    removeById(id: string): boolean {
        if (this.isEmpty()) {
          return false;
        }
    
        let current = this.head;
        
        // Caso especial: eliminar la cabeza
        if (current!.id === id) {
          this.head = current!.next;
          
          if (this.head) {
            this.head.prev = null;
          } else {
            // La lista quedó vacía
            this.tail = null;
          }
          
          // Si el nodo actual era el que se está eliminando
          if (this.current && this.current.id === id) {
            this.current = this.head;
          }
          
          this.length--;
          return true;
        }
    
        // Buscar el nodo a eliminar
        while (current && current.id !== id) {
          current = current.next;
        }
    
        // Si no se encontró el nodo
        if (!current) {
          return false;
        }
    
        // Eliminar el nodo intermedio o final
        if (current.prev) {
          current.prev.next = current.next;
        }
        
        if (current.next) {
          current.next.prev = current.prev;
        } else {
          // Estamos eliminando el último nodo
          this.tail = current.prev;
        }
    
        // Si el nodo actual era el que se está eliminando
        if (this.current && this.current.id === id) {
          this.current = current.next || this.head;
        }
    
        this.length--;
        return true;
      }
      /**
     * Avanza al siguiente nodo
     */
    next(): SongNode | null {
        if (!this.current || !this.current.next) {
            return this.current;
        }

        this.current = this.current.next;
        return this.current;
    }

    /**
     * Retrocede al nodo anterior
     */
    previus(): SongNode | null {
      if (!this.current || !this.current.prev){
        return this.current;
      }
      this.current = this.current.prev;
      return this.current;
    }

    /**
     * Obtiene todas las canciones como un array
     */
    getAll(): SongNode[] {
      const songs: SongNode[] = [];
      let currentNode = this.head;

      while (currentNode){
        songs.push(currentNode);
        currentNode= currentNode.next;
      }
      return songs;
    }

    /**
     * Obtiene la canción actual
     */
    toJson(): any {
      return {
        songs:this.getAll().map(node => ({
          id: node.id,
          title: node.title,
          artist: node.artist,
          duration: node.duration,
          coverURL: node.coverURL
        })),
        currentId: this.current ? this.current.id : null
      };
    }
    /**
     * Reconstruye la lista desde un formato serializado
     */
    static fromJson(data: any): Playlist {
      const playlist = new Playlist();

      if (!data || !data.songs || !Array.isArray(data.songs)) {
        return playlist;
      }

      data.songs.forEach((songData: any)=>{
        const node = new SongNode (songData);
        playlist.addToEnd(node);

        if (data.currentId && songData.id === data.currentId) {
          playlist.current = playlist.tail;
        }
      });

      return playlist;
    }
}