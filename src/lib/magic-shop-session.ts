import { getOperatorAvatar, type OperatorAvatar } from "./operator-avatars";

const SHOP_AVATAR_KEY = "cyrene_magic_shop_avatar";

export function setShopAvatarId(avatarId: string) {
  sessionStorage.setItem(SHOP_AVATAR_KEY, avatarId);
}

export function getShopAvatarId(): string | null {
  return sessionStorage.getItem(SHOP_AVATAR_KEY);
}

export function clearShopAvatar() {
  sessionStorage.removeItem(SHOP_AVATAR_KEY);
}

export function loadShopAvatar(userId: string): OperatorAvatar | null {
  const avatarId = getShopAvatarId();
  if (!avatarId) return null;
  return getOperatorAvatar(userId, avatarId);
}
