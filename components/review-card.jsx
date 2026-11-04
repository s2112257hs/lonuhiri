import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export function ReviewCard({ name, avatar, rating, review, date, popular = false, source }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 py-0 relative ${
        popular ? "ring-2 ring-accent" : ""
      }`}
    >
      {popular && (
        <div className="absolute top-4 right-4 z-10 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
          Popular
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold">{name}</h4>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`${
                    i < rating ? "fill-accent text-accent" : "text-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review || "This guest left a rating without a written review."}
        </p>
        {source === "google" && (
          <p className="mt-4 text-sm font-medium text-teal-700">
            Google review
          </p>
        )}
      </CardContent>
    </Card>
  );
}
