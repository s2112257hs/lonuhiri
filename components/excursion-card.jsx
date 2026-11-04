import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";

export function ExcursionCard({
  title,
  description,
  image,
  duration,
  location,
  price,
  slug,
  popular = false,
}) {
  return (
    <Link href={`/excursions/${slug}`} className="block">
      <Card
        className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-96 py-0 ${
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-xl font-semibold mb-2 text-balance">{title}</h3>

            <p className="text-white/90 text-sm mb-4 leading-relaxed line-clamp-2">
              {description}
            </p>

            <div className="flex flex-col gap-2 mb-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-bold">{price}</span>
                <span className="text-sm text-white/80">/person</span>
              </div>

              <Button
                size="sm"
                className="bg-white text-black hover:bg-white/90"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
