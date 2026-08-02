import Image from "next/image";

export function Brand() {
  return (
    <span className="brand" aria-label="Norma OS">
      <Image
        alt=""
        aria-hidden="true"
        className="brand__icon"
        height={256}
        priority
        sizes="34px"
        src="/brand/app-icon.png"
        width={256}
      />
      <span className="brand__name">Norma OS</span>
    </span>
  );
}
