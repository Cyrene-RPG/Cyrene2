import type { ReactNode } from "react";
import "../pages/MagicShopPage.css";

type MagicShopShellProps = {
  status: string;
  operatorName: string;
  shoppingAvatarName?: string;
  children: ReactNode;
  mainClassName?: string;
};

export default function MagicShopShell({
  status,
  operatorName,
  shoppingAvatarName,
  children,
  mainClassName = "",
}: MagicShopShellProps) {
  return (
    <div className="magicShop">
      <div className="magicShop__bg" />
      <div className="magicShop__mist" />
      <div className="magicShop__scanlines" />
      <div className="magicShop__vignette" />

      <div className="magicShop__frame magicShop__frame--tl" />
      <div className="magicShop__frame magicShop__frame--tr" />
      <div className="magicShop__frame magicShop__frame--bl" />
      <div className="magicShop__frame magicShop__frame--br" />

      <div className="magicShop__hud magicShop__hud--tl">
        <span>MODULE</span>
        <span className="magicShop__hudVal">MAGIC-SHOP</span>
      </div>
      <div className="magicShop__hud magicShop__hud--tr">
        <span>MERCHANT</span>
        <span className="magicShop__hudVal magicShop__hudVal--accent">
          VA&apos;SHIR
        </span>
      </div>
      <div className="magicShop__hud magicShop__hud--bl">
        <span>{shoppingAvatarName ? "AVATAR" : "CUSTOMER"}</span>
        <span className="magicShop__hudVal">
          {(shoppingAvatarName ?? operatorName).toUpperCase()}
        </span>
      </div>
      <div className="magicShop__hud magicShop__hud--br">
        <span>STATUS</span>
        <span className="magicShop__hudVal magicShop__hudVal--live">
          {status}
        </span>
      </div>

      <main className={`magicShop__main${mainClassName ? ` ${mainClassName}` : ""}`}>
        {children}
      </main>
    </div>
  );
}
