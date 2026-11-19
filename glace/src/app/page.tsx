import { TextureBand } from "@/components/brand";
import { Catalog } from "@/components/home/catalog";
import { Hero, InfoStrip } from "@/components/home/hero";
import { PromoStrip } from "@/components/home/promo-strip";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <Hero />
        <TextureBand />
      </div>
      <InfoStrip />
      <PromoStrip />
      <Catalog />
    </div>
  );
}
