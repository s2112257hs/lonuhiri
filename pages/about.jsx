import { Button } from "@/components/ui/button";
import {
  Heart,
  Award,
  Users,
  Globe,
  Star,
  Shield,
  Leaf,
  Zap,
  Smile,
  Sun,
} from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";
import axios from "axios";
import Link from "next/link";

const iconMap = {
  Heart,
  Award,
  Users,
  Globe,
  Star,
  Shield,
  Leaf,
  Zap,
  Smile,
  Sun,
};

export default function AboutPage({ aboutData }) {
  // Default values if no data
  const heroTitle = aboutData?.heroTitle || "About Lonuhiri";
  const heroDescription =
    aboutData?.heroDescription || "Creating unforgettable memories since 2010";
  const heroImage =
    aboutData?.heroImage || "/luxury-guest-house-exterior-pool.jpg";

  const storyTitle = aboutData?.storyTitle || "Our Story";
  const storyContent = aboutData?.storyContent
    ? aboutData.storyContent.split("\n\n").map((para, i) => (
        <p key={i} className="text-muted-foreground leading-relaxed mb-4">
          {para}
        </p>
      ))
    : [
        <p key="1" className="text-muted-foreground leading-relaxed mb-4">
          Lonuhiri was born from a dream to create a sanctuary where travelers
          could escape the ordinary and embrace the extraordinary.
        </p>,
        <p key="2" className="text-muted-foreground leading-relaxed mb-4">
          Over the years, we&apos;ve welcomed thousands of guests from around
          the world, each leaving with memories that last a lifetime.
        </p>,
        <p key="3" className="text-muted-foreground leading-relaxed">
          Every room, every meal, and every experience is crafted with love.
        </p>,
      ];
  const storyImage = aboutData?.storyImage || "/luxury-hotel-room-bed.jpg";

  const valuesTitle = aboutData?.valuesTitle || "Our Values";
  const valuesDescription =
    aboutData?.valuesDescription ||
    "The principles that guide everything we do";
  const values = aboutData?.values || [
    { icon: "Heart", title: "Genuine Hospitality", description: "" },
    { icon: "Award", title: "Excellence", description: "" },
    { icon: "Globe", title: "Sustainability", description: "" },
    { icon: "Users", title: "Community", description: "" },
  ];

  const ctaTitle = aboutData?.ctaTitle || "Ready to Experience Paradise?";
  const ctaDescription =
    aboutData?.ctaDescription || "Your perfect getaway awaits.";
  const ctaButtonText = aboutData?.ctaButtonText || "Book Your Stay";
  const ctaButtonLink = aboutData?.ctaButtonLink || "#";

  return (
    <MainLayout>
      {/* Hero Section */}
      <section
        className="relative h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url('${heroImage}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-background mb-6 text-balance">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-background/90 text-pretty">
            {heroDescription}
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance text-black">
                {storyTitle}
              </h2>
              {storyContent}
            </div>

            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <img
                src={storyImage}
                alt={storyTitle}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              {valuesTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {valuesDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = iconMap[value.icon] || Heart;
              return (
                <Value
                  key={index}
                  icon={Icon}
                  title={value.title}
                  description={value.description}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
            {ctaTitle}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ctaButtonLink.startsWith("#") ? (
              <Button
                asChild
                size="lg"
                className="bg-secondary text-secondary-foreground"
              >
                <Link href={ctaButtonLink === "#" ? "/accommodations" : ctaButtonLink}>{ctaButtonText}</Link>
              </Button>
            ) : (
              <Link href={ctaButtonLink}>
                <Button
                  size="lg"
                  className="bg-secondary text-secondary-foreground"
                >
                  {ctaButtonText}
                </Button>
              </Link>
            )}
            <Button
              asChild
              className="bg-secondary text-secondary-foreground"
              size="lg"
              variant="outline"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

function Value({ icon: Icon, title, description }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-secondary" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-black">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseURL = process.env.NEXT_PUBLIC_API_URL || `${protocol}://${host}`;

  try {
    const response = await axios.get(`${baseURL}/api/about`);

    if (response.data.success) {
      return {
        props: {
          aboutData: response.data.data,
        },
      };
    } else {
      return {
        props: {
          aboutData: null,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching about data:", error);
    return {
      props: {
        aboutData: null,
      },
    };
  }
}
