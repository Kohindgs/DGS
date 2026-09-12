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

function aspectOf(item: JustifiedItem) {
  const w = Math.max(1, item.width);
  const h = Math.max(1, item.height);
  return w / h;
}

/**
 * Envira/Justified-Gallery packing: keep adding items at the target row height
 * until the next item would overflow, then stretch the completed row to fill
 * the container. The leftover last row stays at the target height unless
 * justifyLastRow is true.
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

  const flush = (justify: boolean) => {
    if (!row.length) return;
    const n = row.length;
    const sumAspect = aspects.reduce((sum, value) => sum + value, 0);
    const available = Math.max(1, width - gap * Math.max(0, n - 1));
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

  const naturalWidth = () =>
    aspects.reduce((sum, value) => sum + value, 0) * target + gap * Math.max(0, row.length - 1);

  for (const item of items) {
    row.push(item);
    aspects.push(aspectOf(item));
    if (naturalWidth() > width) {
      if (row.length === 1) {
        flush(true);
      } else {
        const overflowItem = row.pop() as T;
        const overflowAspect = aspects.pop() as number;
        flush(true);
        row = [overflowItem];
        aspects = [overflowAspect];
      }
    }
  }

  flush(Boolean(justifyLastRow));
  return rows;
}
