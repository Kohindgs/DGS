import "server-only";
import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "./db";

export type PortfolioOverride = {
  id: string;
  source_item_id: string;
  title: string | null;
  alt_text: string | null;
  sort_order: number;
  active: number | boolean;
};

export async function listPortfolioOverrides() {
  if (!isCmsDatabaseConfigured()) return [] as PortfolioOverride[];
  const { rows } = await cmsQuery<PortfolioOverride>(
    "SELECT * FROM portfolio_items ORDER BY sort_order ASC, source_item_id ASC",
  );
  return rows;
}

export async function upsertPortfolioOverride(input: {
  sourceItemId: string;
  title?: string;
  altText?: string;
  sortOrder: number;
  active: boolean;
}) {
  await cmsExecute(
    `INSERT INTO portfolio_items (id,source_item_id,title,alt_text,sort_order,active)
     VALUES (?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       title=VALUES(title),
       alt_text=VALUES(alt_text),
       sort_order=VALUES(sort_order),
       active=VALUES(active)`,
    [randomUUID(),input.sourceItemId,input.title||null,input.altText||null,input.sortOrder,input.active],
  );
}
