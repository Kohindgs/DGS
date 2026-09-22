"use client";

import { useState } from "react";
import MediaPicker, { type SelectedMedia } from "@/components/admin/MediaPicker";

interface PortfolioItemRowProps {
  item: {
    id: string;
    title?: string;
    alt?: string;
    type: string;
    sourceWidth?: number;
    sourceHeight?: number;
  };
  row?: {
    title: string | null;
    alt_text: string | null;
    sort_order: number;
    active: number | boolean;
  };
  index: number;
  saveItemAction: (formData: FormData) => Promise<void>;
}

export default function PortfolioItemRow({
  item,
  row,
  index,
  saveItemAction,
}: PortfolioItemRowProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [titleVal, setTitleVal] = useState(row?.title || item.title || "");
  const [altVal, setAltVal] = useState(row?.alt_text || item.alt || "");
  const [chosenMediaUrl, setChosenMediaUrl] = useState<string | null>(null);

  const active = row ? Boolean(row.active) : true;

  const handleMediaSelect = (media: SelectedMedia) => {
    if (media.alt_text) setAltVal(media.alt_text);
    if (media.title && !titleVal) setTitleVal(media.title);
    setChosenMediaUrl(media.public_url);
  };

  return (
    <article className="dgs-admin-record" key={item.id}>
      <div className="dgs-admin-portfolio-preview">
        <span className={active ? "dgs-admin-state live" : "dgs-admin-state"}>
          {active ? "Visible" : "Hidden"}
        </span>
        <h3>{titleVal || item.title || item.id}</h3>
        <p>
          {item.type} · {item.sourceWidth}×{item.sourceHeight}
        </p>
        <code>{item.id}</code>
        {chosenMediaUrl && (
          <p style={{ marginTop: 6, fontSize: "0.74rem", color: "#10b981" }}>
            Linked: {chosenMediaUrl}
          </p>
        )}
      </div>

      <form action={saveItemAction} className="dgs-admin-editor-form dgs-admin-portfolio-form">
        <input type="hidden" name="sourceItemId" value={item.id} />
        <label>
          Title
          <input
            name="title"
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
          />
        </label>
        <label>
          Alt text
          <div style={{ display: "flex", gap: 6 }}>
            <input
              name="altText"
              value={altVal}
              onChange={(e) => setAltVal(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="dgs-media-btn-secondary"
              style={{ padding: "6px 10px", fontSize: "0.75rem", whiteSpace: "nowrap" }}
              onClick={() => setPickerOpen(true)}
              title="Select from Media Library"
            >
              Media
            </button>
          </div>
        </label>
        <label>
          Order
          <input name="sortOrder" type="number" defaultValue={row?.sort_order ?? index} />
        </label>
        <label>
          Visibility
          <select name="active" defaultValue={String(active)}>
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
        </label>
        <button type="submit">Save</button>
      </form>

      {pickerOpen && (
        <MediaPicker
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleMediaSelect}
          mediaType="image"
          title={`Select Media for ${item.title || item.id}`}
        />
      )}
    </article>
  );
}
