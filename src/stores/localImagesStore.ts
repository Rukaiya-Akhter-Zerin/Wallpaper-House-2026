import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalImage {
  id: string;
  name: string;
  localPath: string;
  collectionId: number | null;
  addedAt: string;
}

interface LocalImagesState {
  images: LocalImage[];
  addImage: (name: string, localPath: string, collectionId: number | null) => void;
  addImages: (files: { name: string; localPath: string }[], collectionId: number | null) => void;
  removeImage: (id: string) => void;
  removeImagesForCollection: (collectionId: number) => void;
  getImagesForCollection: (collectionId: number) => LocalImage[];
}

export const useLocalImagesStore = create<LocalImagesState>()(
  persist(
    (set, get) => ({
      images: [],

      addImage: (name, localPath, collectionId) => {
        const image: LocalImage = {
          id: crypto.randomUUID(),
          name,
          localPath,
          collectionId,
          addedAt: new Date().toISOString(),
        };
        set((state) => ({ images: [...state.images, image] }));
      },

      addImages: (files, collectionId) => {
        const newImages: LocalImage[] = files.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          localPath: file.localPath,
          collectionId,
          addedAt: new Date().toISOString(),
        }));
        set((state) => ({ images: [...state.images, ...newImages] }));
      },

      removeImage: (id) => {
        set((state) => ({ images: state.images.filter((img) => img.id !== id) }));
      },

      removeImagesForCollection: (collectionId) => {
        set((state) => ({
          images: state.images.filter((img) => img.collectionId !== collectionId),
        }));
      },

      getImagesForCollection: (collectionId) => {
        return get().images.filter((img) => img.collectionId === collectionId);
      },
    }),
    {
      name: "wh-local-images",
    }
  )
);
