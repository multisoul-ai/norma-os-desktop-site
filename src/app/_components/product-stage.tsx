import type { ReactNode } from "react";

type ProductStageProps = {
  children: ReactNode;
  label: string;
};

export function ProductStage({
  children,
  label,
}: ProductStageProps) {
  return (
    <div
      aria-label={label}
      className="product-stage"
      data-material="liquid-glass"
      role="group"
    >
      <div className="product-stage__rim" aria-hidden="true" />
      <div className="product-stage__viewport">{children}</div>
    </div>
  );
}
