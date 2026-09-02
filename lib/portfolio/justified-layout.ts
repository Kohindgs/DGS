export type JustifiedItem = {
  id: number;
  width: number;
  height: number;
};

export type JustifiedCell<T extends JustifiedItem> = {
  item: T;
  width: number;
  height: number;
};

export type JustifiedRow<T extends JustifiedItem> = {
  height: number;
  items: JustifiedCell<T>[];
};

export type JustifiedLayoutOptions = {
  containerWidth: number;
  rowHeight: number;
  gutter: number;
  justifyLastRow?: boolean;
};

/**
 * Flickr/Envira-style justified rows. Last row stays at target row height unless justifyLastRow is true.
 */
export function layoutJustified<T extends JustifiedItem>(
  items: T[],
  { containerWidth, rowHeight, gutter, justifyLastRow = false }: JustifiedLayoutOptions,
): JustifiedRow<T>[] {
  const width = Math.max(1, containerWidth);
  const target = Math.max(1, rowHeight);
  const gap = Math.max(0, gutter);
  const rows: JustifiedRow<T>[] = [];
  let row: T[] = [];
  let aspects: number[] = [];

  const aspectOf = (item: T) => {
    const w = Math.max(1, item.width);
    const h = Math.max(1, item.height);
    return w / h;
  };

  const flush = (justify: boolean) => {
    if (!row.length) return;
    const n = row.length;
    const sumAspect = aspects.reduce((sum, value) => sum + value, 0);
    const available = width - gap * Math.max(0, n - 1);
    const height = justify ? available / sumAspect : target;
    rows.push({
      height,
      items: row.map((item, index) => ({
        item,
        width: aspects[index] * height,
        height,
      })),
    });
    row = [];
    aspects = [];
  };

  for (const item of items) {
    row.push(item);
    aspects.push(aspectOf(item));
    const n = row.length;
    const naturalWidth = aspects.reduce((sum, value) => sum + value, 0) * target + gap * Math.max(0, n - 1);
    if (naturalWidth >= width) {
      flush(true);
    }
  }

  flush(Boolean(justifyLastRow));
  return rows;
}
