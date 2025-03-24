import { SongNode } from "../entities/SongNode";
import { Playlist } from "../entities/Playlist";

/**
 * Patrón Strategy para diferentes formas de agregar canciones a la lista
 */
export interface AddStrategy {
  add(node: SongNode, playlist: Playlist): void;
}

export class AddToStart implements AddStrategy {
  add(node: SongNode, playlist: Playlist): void {
    playlist.addToStart(node);
  }
}

export class AddToEnd implements AddStrategy {
  add(node: SongNode, playlist: Playlist): void {
    playlist.addToEnd(node);
  }
}

export class AddAfterCurrent implements AddStrategy {
  add(node: SongNode, playlist: Playlist): void {
    if (playlist.isEmpty() || !playlist.current) {
      playlist.addToStart(node);
      return;
    }

    node.next = playlist.current.next;
    node.prev = playlist.current;

    if (playlist.current.next) {
      playlist.current.next.prev = node;
    } else {
      playlist.tail = node;
    }

    playlist.current.next = node;
  }
}
