export const MAGIC_SHOP_PATH = "/magic-shop";
export const MAGIC_SHOP_SELECT_AVATAR_PATH = "/magic-shop/select-avatar";
export const MAGIC_SHOP_BROWSE_PATH = "/magic-shop/browse";

export type ShopAction = "browse" | "trade" | "leave";

export const OPENING_LINE =
  "Welcome to Va'shir's Magic Shop. Va'shir has many things you need... and many you want.";

export const AVATAR_SELECT_LINE =
  "Every artifact binds to a vessel. Tell Va'shir which avatar is doing the shopping tonight.";

export const SHOP_RESPONSES: Record<Exclude<ShopAction, "leave">, string> = {
  browse:
    "Take your time. Rare things rarely wait for the indecisive. The shelves shift when you're not looking.",
  trade:
    "Show Va'shir what you carry. Fair trade is a matter of perspective — and occasionally, blood.",
};

export type ShopItem = {
  id: string;
  name: string;
  tag: string;
  description: string;
  credits: number;
};

/** Edit this list to stock Va'shir's shop. */
export const SHOP_CATALOG: ShopItem[] = [
  {
    id: "healing-lesser",
    name: "Potion of Healing, Lesser",
    tag: "Potion",
    description:
      "A tart crimson draught in a wax-sealed vial. Closes cuts, staunches bleeding, steadies the pulse—standard fare for runners and adventurers alike.",
    credits: 28,
  },
  {
    id: "healing-greater",
    name: "Potion of Healing, Greater",
    tag: "Potion",
    description:
      "Concentrated elixir of renewal, gold-flecked and warm to the touch. Mends grievous wounds and deep trauma that lesser brews cannot reach.",
    credits: 85,
  },
  {
    id: "pocket-firewall",
    name: "Pocket Firewall Charm",
    tag: "Charm",
    description:
      "A warded trinket of etched copper and null-thread. Within fifteen feet, cameras, mics, and trackers catch only dead air—no arcane or electronic eye pierces its radius.",
    credits: 140,
  },
];
