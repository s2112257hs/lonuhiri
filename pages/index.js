import { AccommodationCard } from "@/components/accommodation-card";
import { PackageCard } from "@/components/package-card";
import { ExcursionCard } from "@/components/excursion-card";
import { ReviewCard } from "@/components/review-card";
import { ReelCard } from "@/components/reel-card";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

export default function Home({
  accommodations = [],
  packages = [],
  excursions = [],
  reviews = [],
  reels = [],
  homeData = null,
}) {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section
        id="home"
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image or Video */}
        {homeData?.banner?.type === "video" && homeData?.banner?.url ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={homeData.banner.url} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: homeData?.banner?.url
                ? `url(${homeData.banner.url})`
                : "url(/luxury-guest-house-exterior-pool.jpg)",
            }}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-background mb-6 text-balance">
            {homeData?.heroTitle || "Your Paradise Awaits"}
          </h1>
          <p className="text-xl md:text-2xl text-background/90 mb-8 text-pretty">
            {homeData?.heroDescription ||
              "Experience luxury, comfort, and unforgettable moments at our exclusive guest house"}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
                Welcome to Lonuhiri
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4 text-black">
                Nestled in the heart of paradise, our guest house offers a
                unique blend of luxury, comfort, and natural beauty. With
                stunning views, world-class amenities, and personalized service,
                we create unforgettable experiences for every guest.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 text-black">
                Whether you&apos;re seeking adventure, relaxation, or a romantic
                getaway, our carefully curated accommodations and excursions
                ensure your stay is nothing short of extraordinary.
              </p>
              <Link href="/about">
                <Button className="bg-secondary text-secondary-foreground">
                  Learn More About Us
                </Button>
              </Link>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
              <img
                src={
                  homeData?.aboutSectionImage ||
                  "/luxury-guest-house-exterior-pool.jpg"
                }
                alt="Guest House"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Accommodations Section */}
      <section id="accommodations" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Our Accommodations
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-black">
              Choose from our selection of beautifully designed rooms and
              suites, each offering comfort and luxury
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {accommodations.length > 0 ? (
              accommodations.map((accommodation) => (
                <AccommodationCard
                  key={accommodation._id}
                  title={accommodation.title}
                  description={accommodation.description}
                  image={accommodation.image}
                  guests={accommodation.guests}
                  beds={accommodation.beds}
                  price={`$${accommodation.price}`}
                  slug={accommodation.slug}
                  popular={accommodation.popular}
                />
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground">
                No accommodations available
              </p>
            )}
          </div>
          {accommodations.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/accommodations">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  View All Accommodations
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Special Packages
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-black">
              Discover our curated packages designed to give you the best
              experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {packages.length > 0 ? (
              packages.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  title={pkg.title}
                  description={pkg.description}
                  price={`$${pkg.price}`}
                  image={pkg.image}
                  features={pkg.features || []}
                  popular={pkg.popular}
                  slug={pkg.slug}
                />
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground">
                No packages available
              </p>
            )}
          </div>
          {packages.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/packages">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  View All Packages
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Excursions Section */}
      <section id="excursions" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Exciting Excursions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-black">
              Explore the beauty and adventure that surrounds our guest house
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {excursions.length > 0 ? (
              excursions.map((excursion) => (
                <ExcursionCard
                  key={excursion._id}
                  title={excursion.title}
                  description={excursion.description}
                  image={excursion.image}
                  duration={excursion.duration}
                  location={excursion.location}
                  price={`$${excursion.price}`}
                  slug={excursion.slug}
                  popular={excursion.popular}
                />
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground">
                No excursions available
              </p>
            )}
          </div>
          {excursions.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/excursions">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  View All Excursions
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Reels Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Experience Paradise
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-black">
              Watch our guests&apos; favorite moments and get inspired for your
              visit
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reels.length > 0 ? (
              reels.map((reel) => (
                <ReelCard
                  key={reel._id}
                  thumbnail={reel.thumbnail}
                  title={reel.title}
                  video={reel.video}
                  popular={reel.popular}
                />
              ))
            ) : (
              <p className="col-span-4 text-center text-muted-foreground">
                No reels available
              </p>
            )}
          </div>
          {reels.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/reels">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  View All Reels
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Guest Reviews
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-black    ">
              See what our guests are saying about their paradise experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  name={review.name}
                  rating={review.rating}
                  review={review.review}
                  date={review.date}
                  avatar={review.avatar}
                  popular={review.popular}
                  source={review.source}
                />
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground">
                No reviews available
              </p>
            )}
          </div>
          {/* {reviews.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/reviews">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  View All Reviews
                </Button>
              </Link>
            </div>
          )} */}
        </div>
      </section>
    </MainLayout>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const baseURL = `${protocol}://${host}`;

    // Fetch all data in parallel - showing featured items
    const [
      accommodationsRes,
      packagesRes,
      excursionsRes,
      reviewsRes,
      reelsRes,
      homeRes,
    ] = await Promise.allSettled([
      axios.get(
        `${baseURL}/api/accommodations?isActive=true&featured=true&limit=6&sortBy=order`,
      ),
      axios.get(
        `${baseURL}/api/packages?isActive=true&featured=true&limit=3&sortBy=order`,
      ),
      axios.get(
        `${baseURL}/api/excursions?isActive=true&featured=true&limit=3&sortBy=order`,
      ),
      axios.get(
        `${baseURL}/api/reviews?isActive=true&featured=true&limit=6&sortBy=order`,
      ),
      axios.get(
        `${baseURL}/api/reels?isActive=true&featured=true&limit=4&sortBy=order`,
      ),
      axios.get(`${baseURL}/api/home`, {
        validateStatus: (status) => status === 200 || status === 404,
      }),
    ]);

    return {
      props: {
        accommodations:
          accommodationsRes.status === "fulfilled"
            ? accommodationsRes.value.data.data || []
            : [],
        packages:
          packagesRes.status === "fulfilled"
            ? packagesRes.value.data.data || []
            : [],
        excursions:
          excursionsRes.status === "fulfilled"
            ? excursionsRes.value.data.data || []
            : [],
        reviews:
          reviewsRes.status === "fulfilled"
            ? reviewsRes.value.data.data || []
            : [],
        reels:
          reelsRes.status === "fulfilled" ? reelsRes.value.data.data || [] : [],
        homeData:
          homeRes.status === "fulfilled" && homeRes.value.status === 200
            ? homeRes.value.data
            : null,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        accommodations: [],
        packages: [],
        excursions: [],
        reviews: [],
        reels: [],
        homeData: null,
      },
    };
  }
}
