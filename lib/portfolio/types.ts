export type HomepageGalleryItem = {
  id: number | string;
  title: string;
  alt: string;
  thumbnail: string;
  media: string;
  width: number;
  height: number;
};

export type HomepageGalleryData = {
  galleryId: number;
  items: HomepageGalleryItem[];
};
