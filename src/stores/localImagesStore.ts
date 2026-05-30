import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalImage {
  id: string;
  name: string;
  title: string;
  localPath: string;
  original_path: string;
  collectionId: number | null;
  addedAt: string;
}

interface LocalImagesState {
  images: LocalImage[];
  addImage: (name: string, localPath: string, collectionId: number | null) => void;
  addImages: (files: { name: string; localPath: string }[], collectionId: number | null) => void;
  addLocalImage: (collectionId: number, image: { id: string; title: string; image_url: string; thumbnail_url_medium: string; width: number; height: number; resolution: string; is_local: true; original_path: string }) => void;
  removeImage: (id: string) => void;
  removeImagesForCollection: (collectionId: number) => void;
  getImagesForCollection: (collectionId: number) => LocalImage[];
  getCollectionImages: (collectionId: number) => LocalImage[];
}

export const useLocalImagesStore = create<LocalImagesState>()(
  persist(
    (set, get) => ({
      images: [],

      addImage: (name, localPath, collectionId) => {
        const image: LocalImage = {
          id: crypto.randomUUID(),
          name,
          title: name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          localPath,
          original_path: localPath,
          collectionId,
          addedAt: new Date().toISOString(),
        };
        set((state) => ({ images: [...state.images, image] }));
      },

      addImages: (files, collectionId) => {
        const newImages: LocalImage[] = files.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          localPath: file.localPath,
          original_path: file.localPath,
          collectionId,
          addedAt: new Date().toISOString(),
        }));
        set((state) => ({ images: [...state.images, ...newImages] }));
      },

      addLocalImage: (collectionId, image) => {
        const localImage: LocalImage = {
          id: image.id,
          name: image.title,
          title: image.title,
          localPath: image.original_path,
          original_path: image.original_path,
          collectionId,
          addedAt: new Date().toISOString(),
        };
        set((state) => ({ images: [...state.images, localImage] }));
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

      getCollectionImages: (collectionId) => {
        return get().images.filter((img) => img.collectionId === collectionId);
      },
    }),
    {
      name: "wh-local-images",
    }
  )
);
