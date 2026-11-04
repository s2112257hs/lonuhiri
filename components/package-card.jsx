import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function PackageCard({
  title,
  description,
  price,
  features,
  popular = false,
  image,
  slug,
}) {
  return (
    <Link href={`/packages/${slug}`} className="block">
      <Card
        className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-[550px] py-0 ${
          popular ? "ring-2 ring-accent" : ""
        }`}
      >
        {popular && (
          <div className="absolute top-4 right-4 z-10 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
            Popular
          </div>
        )}

        <div className="relative h-full w-full">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

          {/* Content overlaid on image */}
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
            <h3 className="text-2xl font-semibold mb-2 text-balance">
              {title}
            </h3>
            <p className="text-white/90 text-sm mb-4 leading-relaxed">
              {description}
            </p>

            <div className="mb-4">
              <span className="text-3xl font-bold">{price}</span>
              <span className="text-sm text-white/80">/person</span>
            </div>

            <ul className="space-y-2 mb-6">
              {features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check size={18} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-white/90">{feature}</span>
                </li>
              ))}
              {features.length > 4 && (
                <li className="flex items-center gap-2 text-sm">
                  <Badge
                    variant="secondary"
                    className="bg-accent/20 text-accent-foreground border-accent/30"
                  >
                    +{features.length - 4} more
                  </Badge>
                </li>
              )}
            </ul>

            <Button
              className="w-full"
              variant={popular ? "default" : "secondary"}
            >
              Book Package
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
