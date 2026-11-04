import connectToDatabase from "@/lib/mongodb";
import Accommodation from "@/models/Accommodation";
import Package from "@/models/Package";
import Excursion from "@/models/Excursion";
import Review from "@/models/Review";
import Reel from "@/models/Reel";
import Home from "@/models/Home";
import Booking from "@/models/Booking";
import { generateSlug } from "@/lib/utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required." });
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();

    // Seed Accommodations
    const accommodations = [
      {
        title: "Deluxe Room",
        description:
          "Spacious and elegantly designed with modern amenities and a private balcony",
        longDescription:
          "Our Deluxe Room offers the perfect blend of comfort and elegance. Featuring a king-size bed, modern furnishings, and a private balcony overlooking the gardens, this room is ideal for couples or solo travelers seeking a peaceful retreat.",
        image: "/luxury-hotel-room-bed.jpg",
        images: ["/hotel-room-balcony.jpg", "/hotel-room-bathroom.jpg"],
        price: 150,
        guests: 2,
        beds: 1,
        size: "35 sqm",
        amenities: [
          { name: "High-Speed WiFi", icon: "Wifi" },
          { name: "Smart TV", icon: "Tv" },
          { name: "Coffee Maker", icon: "Coffee" },
          { name: "Air Conditioning", icon: "Wind" },
        ],
        features: [
          "King-size bed with premium linens",
          "Private balcony with garden views",
          "Marble bathroom with rain shower",
          "Mini bar and coffee station",
          "Safe deposit box",
          "Daily housekeeping",
          "Complimentary breakfast",
        ],
        order: 1,
        featured: true,
        popular: true,
        isActive: true,
      },
      {
        title: "Ocean View Suite",
        description:
          "Wake up to breathtaking ocean views in this premium suite with living area",
        longDescription:
          "Experience luxury at its finest in our Ocean View Suite. This spacious suite features a separate living area, master bedroom, and expansive balcony with panoramic ocean views.",
        image: "/ocean-view-hotel-suite.jpg",
        images: ["/suite-living-room.jpg", "/ocean-balcony-view.jpg"],
        price: 280,
        guests: 3,
        beds: 2,
        size: "65 sqm",
        amenities: [
          { name: "High-Speed WiFi", icon: "Wifi" },
          { name: "Smart TV", icon: "Tv" },
          { name: "Coffee Maker", icon: "Coffee" },
          { name: "Air Conditioning", icon: "Wind" },
        ],
        features: [
          "Separate living and sleeping areas",
          "Panoramic ocean views",
          "King bed and sofa bed",
          "Large balcony with seating",
          "Premium bathroom with bathtub",
          "Full mini bar",
          "Butler service available",
          "Complimentary breakfast and afternoon tea",
        ],
        order: 2,
        featured: true,
        popular: false,
        isActive: true,
      },
      {
        title: "Family Villa",
        description:
          "Perfect for families with separate bedrooms, kitchen, and private pool",
        longDescription:
          "Our Family Villa is the ultimate retreat for larger groups and families. This standalone villa features three bedrooms, a fully equipped kitchen, spacious living areas, and a private pool.",
        image: "/luxury-villa-pool.png",
        images: ["/villa-interior-living.jpg", "/villa-bedroom.jpg"],
        price: 450,
        guests: 6,
        beds: 3,
        size: "120 sqm",
        amenities: [
          { name: "High-Speed WiFi", icon: "Wifi" },
          { name: "Multiple Smart TVs", icon: "Tv" },
          { name: "Full Kitchen", icon: "Coffee" },
          { name: "Central Air", icon: "Wind" },
        ],
        features: [
          "Three separate bedrooms",
          "Private swimming pool",
          "Fully equipped kitchen",
          "Spacious living and dining areas",
          "Outdoor terrace with BBQ",
          "Multiple bathrooms",
          "Laundry facilities",
          "Personal concierge service",
          "Complimentary meals for all guests",
        ],
        order: 3,
        featured: true,
        popular: false,
        isActive: true,
      },
    ];

    // Seed Packages
    const packages = [
      {
        title: "Relaxation Retreat",
        description:
          "Unwind and rejuvenate with spa treatments and peaceful activities",
        longDescription:
          "Escape the stresses of daily life with our Relaxation Retreat package. Designed for those seeking peace and rejuvenation, this package combines luxurious accommodations with world-class spa treatments, yoga sessions, and healthy dining options.",
        image: "/luxury-spa-retreat-relaxation-massage.jpg",
        price: 599,
        duration: "3 nights / 4 days",
        maxGuests: 2,
        order: 1,
        featured: true,
        popular: false,
        features: [
          "3 nights accommodation in Deluxe Room",
          "Daily breakfast buffet with healthy options",
          "Full spa access throughout your stay",
          "Two 60-minute massage sessions",
          "Daily yoga and meditation classes",
          "One aromatherapy facial treatment",
          "Access to sauna and steam room",
          "Complimentary herbal teas and wellness drinks",
        ],
        itinerary: [
          {
            day: "Day 1",
            title: "Arrival & Welcome",
            activities: [
              "Check-in and welcome drink",
              "Spa orientation and consultation",
              "Evening sunset yoga session",
              "Welcome dinner at our restaurant",
            ],
          },
          {
            day: "Day 2",
            title: "Spa & Relaxation",
            activities: [
              "Healthy breakfast buffet",
              "Morning meditation session",
              "90-minute full body massage",
              "Lunch by the pool",
              "Afternoon aromatherapy facial",
              "Evening relaxation time",
            ],
          },
          {
            day: "Day 3",
            title: "Wellness Day",
            activities: [
              "Sunrise yoga session",
              "Spa breakfast",
              "Sauna and steam room access",
              "60-minute hot stone massage",
              "Healthy cooking class",
              "Farewell dinner",
            ],
          },
          {
            day: "Day 4",
            title: "Departure",
            activities: [
              "Final morning yoga session",
              "Checkout with wellness kit gift",
            ],
          },
        ],
        isActive: true,
      },
      {
        title: "Adventure Package",
        description:
          "Experience thrilling activities and explore the natural wonders",
        longDescription:
          "For the thrill-seekers and nature lovers, our Adventure Package offers an action-packed experience filled with exciting excursions and outdoor activities.",
        image: "/tropical-adventure-activities-hiking-water-sports.jpg",
        price: 799,
        duration: "4 nights / 5 days",
        maxGuests: 4,
        order: 2,
        featured: true,
        popular: true,
        features: [
          "4 nights accommodation in Ocean View Suite",
          "All meals included (breakfast, lunch, dinner)",
          "Guided rainforest hiking tour",
          "Full-day island excursion by boat",
          "Snorkeling and water sports activities",
          "Kayaking expedition",
          "Mountain biking adventure",
          "All adventure equipment provided",
          "Professional guides and instructors",
          "Adventure photography package",
        ],
        itinerary: [
          {
            day: "Day 1",
            title: "Arrival & Orientation",
            activities: [
              "Check-in and welcome briefing",
              "Equipment fitting and safety orientation",
              "Beach kayaking introduction",
              "Welcome BBQ dinner",
            ],
          },
          {
            day: "Day 2",
            title: "Rainforest Adventure",
            activities: [
              "Early breakfast",
              "Guided rainforest hiking trek",
              "Waterfall swimming",
              "Picnic lunch in nature",
              "Wildlife spotting",
              "Return and dinner",
            ],
          },
          {
            day: "Day 3",
            title: "Water Adventures",
            activities: [
              "Hearty breakfast",
              "Full-day island boat excursion",
              "Snorkeling at coral reefs",
              "Beach lunch",
              "Stand-up paddleboarding",
              "Sunset cruise",
            ],
          },
          {
            day: "Day 4",
            title: "Mountain Exploration",
            activities: [
              "Breakfast",
              "Mountain biking adventure",
              "Scenic viewpoint lunch",
              "Afternoon water sports session",
              "Farewell adventure dinner",
            ],
          },
          {
            day: "Day 5",
            title: "Departure",
            activities: [
              "Final breakfast",
              "Photo package delivery",
              "Checkout",
            ],
          },
        ],
        isActive: true,
      },
      {
        title: "Romantic Getaway",
        description: "Create unforgettable memories with your loved one",
        longDescription:
          "Celebrate your love with our exclusive Romantic Getaway package. Perfect for honeymoons, anniversaries, or simply spending quality time together.",
        image: "/romantic-couple-beach-sunset-dinner.jpg",
        price: 899,
        duration: "3 nights / 4 days",
        maxGuests: 2,
        order: 3,
        featured: true,
        popular: false,
        features: [
          "3 nights in Ocean View Suite with king bed",
          "Champagne and rose petals on arrival",
          "Daily breakfast in bed available",
          "Couples spa treatment (90 minutes)",
          "Private beach dinner with personal chef",
          "Sunset cruise with champagne",
          "Professional couples photoshoot",
          "Candlelit dinner at our restaurant",
          "Late checkout (subject to availability)",
        ],
        itinerary: [
          {
            day: "Day 1",
            title: "Welcome to Paradise",
            activities: [
              "Check-in with champagne welcome",
              "Suite decorated with roses and candles",
              "Afternoon at leisure",
              "Romantic candlelit dinner",
            ],
          },
          {
            day: "Day 2",
            title: "Couples Spa Day",
            activities: [
              "Breakfast in bed",
              "Morning at leisure by the pool",
              "Couples massage and spa treatment",
              "Afternoon tea for two",
              "Sunset cruise with champagne",
              "Dinner on the terrace",
            ],
          },
          {
            day: "Day 3",
            title: "Private Beach Experience",
            activities: [
              "Leisure breakfast",
              "Professional couples photoshoot",
              "Private beach setup",
              "Private beach dinner prepared by chef",
              "Stargazing experience",
            ],
          },
          {
            day: "Day 4",
            title: "Farewell",
            activities: [
              "Final breakfast together",
              "Late checkout",
              "Departure with photo album gift",
            ],
          },
        ],
        isActive: true,
      },
    ];

    // Seed Excursions
    const excursions = [
      {
        title: "Sunset Sailing",
        description:
          "Experience the magic of a tropical sunset while sailing the crystal-clear waters",
        longDescription:
          "Set sail on a breathtaking journey across the crystal-clear waters as the sun paints the sky in vibrant hues of orange, pink, and gold.",
        image: "/sunset-sailing-boat.jpg",
        duration: "3 hours",
        location: "Marina Bay",
        price: 85,
        maxGuests: 12,
        difficulty: "Easy",
        order: 1,
        featured: true,
        popular: true,
        highlights: [
          "Professional captain and crew",
          "Complimentary drinks and snacks",
          "Swimming stop at secluded bay",
          "Stunning sunset views",
          "Photo opportunities",
          "Small group experience",
        ],
        includes: [
          "Round-trip transportation from guest house",
          "Professional sailing crew",
          "Life jackets and safety equipment",
          "Refreshments and light snacks",
          "Swimming equipment",
          "Towels provided",
        ],
        schedule: {
          departure: "4:30 PM",
          return: "7:30 PM",
          availability: "Daily (weather permitting)",
        },
        whatToBring: [
          "Sunscreen and sunglasses",
          "Camera or smartphone",
          "Light jacket (optional)",
          "Swimwear and change of clothes",
        ],
        isActive: true,
      },
      {
        title: "Rainforest Hiking",
        description:
          "Discover exotic wildlife and hidden waterfalls on this guided rainforest trek",
        longDescription:
          "Embark on an unforgettable journey through lush tropical rainforest, where every step reveals new wonders of nature.",
        image: "/tropical-rainforest-waterfall.jpg",
        duration: "5 hours",
        location: "Paradise Forest",
        price: 65,
        maxGuests: 10,
        difficulty: "Moderate",
        order: 2,
        featured: true,
        popular: false,
        highlights: [
          "Expert naturalist guide",
          "Hidden waterfall swimming",
          "Wildlife spotting opportunities",
          "Exotic plant identification",
          "Scenic viewpoints",
          "Jungle lunch experience",
        ],
        includes: [
          "Round-trip transportation",
          "Professional guide",
          "Packed lunch and water",
          "Hiking equipment if needed",
          "First aid kit",
          "Insect repellent",
        ],
        schedule: {
          departure: "8:00 AM",
          return: "1:00 PM",
          availability: "Daily",
        },
        whatToBring: [
          "Comfortable hiking shoes",
          "Long pants and long sleeves",
          "Rain jacket",
          "Camera",
          "Reusable water bottle",
          "Small backpack",
        ],
        isActive: true,
      },
      {
        title: "Snorkeling Adventure",
        description:
          "Dive into vibrant coral reefs and swim with colorful marine life",
        longDescription:
          "Plunge into an underwater paradise and explore the vibrant world beneath the waves.",
        image: "/snorkeling-coral-reef.jpg",
        duration: "4 hours",
        location: "Coral Bay",
        price: 75,
        maxGuests: 15,
        difficulty: "Easy",
        order: 3,
        featured: true,
        popular: true,
        highlights: [
          "Multiple snorkeling sites",
          "Professional snorkel instructor",
          "Marine life identification",
          "Underwater photography tips",
          "Sea turtle sightings common",
          "Beach break with refreshments",
        ],
        includes: [
          "Boat transportation to sites",
          "All snorkeling equipment",
          "Professional guide",
          "Safety briefing",
          "Life vests available",
          "Snacks and beverages",
          "Underwater camera (for rent)",
        ],
        schedule: {
          departure: "9:00 AM",
          return: "1:00 PM",
          availability: "Daily (weather permitting)",
        },
        whatToBring: [
          "Swimwear and towel",
          "Sunscreen (reef-safe)",
          "Rash guard or t-shirt",
          "Waterproof phone case",
          "Change of clothes",
        ],
        isActive: true,
      },
    ];

    // Seed Reviews
    const reviews = [
      {
        name: "Sarah Johnson",
        avatar: "",
        rating: 5,
        review:
          "Absolutely incredible experience! The staff was amazing, the rooms were pristine, and the views were breathtaking. Can't wait to come back!",
        date: "2 weeks ago",
        order: 1,
        featured: true,
        popular: true,
        isActive: true,
      },
      {
        name: "Michael Chen",
        avatar: "",
        rating: 5,
        review:
          "Best vacation ever! The excursions were well-organized, and the food was exceptional. Lonuhiri exceeded all expectations.",
        date: "1 month ago",
        order: 2,
        featured: true,
        popular: false,
        isActive: true,
      },
      {
        name: "Emma Williams",
        avatar: "",
        rating: 5,
        review:
          "A truly magical place. From the moment we arrived, we felt welcomed and pampered. The romantic package was perfect for our anniversary.",
        date: "3 weeks ago",
        order: 3,
        featured: true,
        popular: true,
        isActive: true,
      },
      {
        name: "David Martinez",
        avatar: "",
        rating: 5,
        review:
          "The family villa was spacious and beautiful. Our kids loved the pool, and we enjoyed the peaceful atmosphere. Highly recommend!",
        date: "2 months ago",
        order: 4,
        featured: true,
        popular: false,
        isActive: true,
      },
      {
        name: "Lisa Anderson",
        avatar: "",
        rating: 5,
        review:
          "Perfect blend of relaxation and adventure. The spa was divine, and the snorkeling excursion was unforgettable. Will definitely return!",
        date: "1 month ago",
        order: 5,
        featured: true,
        popular: true,
        isActive: true,
      },
      {
        name: "James Brown",
        avatar: "",
        rating: 5,
        review:
          "Outstanding service and beautiful accommodations. The sunset sailing was the highlight of our trip. Thank you for making our stay special!",
        date: "3 weeks ago",
        order: 6,
        featured: true,
        popular: false,
        isActive: true,
      },
    ];

    // Seed Reels
    const reels = [
      {
        title: "Beach Sunset",
        thumbnail: "/tropical-beach-sunset.png",
        video: "",
        order: 1,
        featured: true,
        popular: true,
        isActive: true,
      },
      {
        title: "Pool Vibes",
        thumbnail: "/pool-luxury-resort.jpg",
        video: "",
        order: 2,
        featured: true,
        popular: false,
        isActive: true,
      },
      {
        title: "Spa Day",
        thumbnail: "/spa-relaxation-massage.jpg",
        video: "",
        order: 3,
        featured: true,
        popular: true,
        isActive: true,
      },
      {
        title: "Culinary Delights",
        thumbnail: "/tropical-food-dining.jpg",
        video: "",
        order: 4,
        featured: true,
        popular: false,
        isActive: true,
      },
    ];

    // Seed Home content
    const homeData = {
      banner: {
        type: "image",
        url: "/luxury-guest-house-exterior-pool.jpg",
      },
      heroTitle: "Your Paradise Awaits",
      heroDescription:
        "Experience luxury, comfort, and unforgettable moments at our exclusive guest house",
    };

    // Clear existing data and insert new data
    const results = {
      accommodations: 0,
      packages: 0,
      excursions: 0,
      reviews: 0,
      reels: 0,
      bookings: 0,
      home: null,
    };

    // Fix any existing documents with null slugs (they will be regenerated on next update)
    const nullSlugAccommodations = await Accommodation.find({ slug: null });
    for (const acc of nullSlugAccommodations) {
      await acc.save(); // This will trigger pre-save hook to generate slug
    }

    const nullSlugPackages = await Package.find({ slug: null });
    for (const pkg of nullSlugPackages) {
      await pkg.save(); // This will trigger pre-save hook to generate slug
    }

    const nullSlugExcursions = await Excursion.find({ slug: null });
    for (const exc of nullSlugExcursions) {
      await exc.save(); // This will trigger pre-save hook to generate slug
    }

    // Store created IDs for bookings
    const createdAccommodations = [];
    const createdPackages = [];
    const createdExcursions = [];

    // Insert accommodations (upsert by title, slug will be auto-generated)
    for (const acc of accommodations) {
      const existing = await Accommodation.findOne({ title: acc.title });
      let accommodationDoc;
      if (existing) {
        // Update existing document
        accommodationDoc = await Accommodation.findByIdAndUpdate(existing._id, acc, {
          new: true,
        });
      } else {
        // Generate slug before saving to avoid validation error
        const slug = generateSlug(acc.title);
        // Check if slug already exists and make it unique
        let uniqueSlug = slug;
        let counter = 1;
        while (await Accommodation.findOne({ slug: uniqueSlug })) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        // Create new document with slug
        accommodationDoc = await new Accommodation({ ...acc, slug: uniqueSlug }).save();
      }
      createdAccommodations.push(accommodationDoc);
      results.accommodations++;
    }

    // Insert packages (upsert by title, slug will be auto-generated)
    for (const pkg of packages) {
      const existing = await Package.findOne({ title: pkg.title });
      let packageDoc;
      if (existing) {
        // Update existing document
        packageDoc = await Package.findByIdAndUpdate(existing._id, pkg, {
          new: true,
        });
      } else {
        // Generate slug before saving to avoid validation error
        const slug = generateSlug(pkg.title);
        // Check if slug already exists and make it unique
        let uniqueSlug = slug;
        let counter = 1;
        while (await Package.findOne({ slug: uniqueSlug })) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        // Create new document with slug
        packageDoc = await new Package({ ...pkg, slug: uniqueSlug }).save();
      }
      createdPackages.push(packageDoc);
      results.packages++;
    }

    // Insert excursions (upsert by title, slug will be auto-generated)
    for (const exc of excursions) {
      const existing = await Excursion.findOne({ title: exc.title });
      let excursionDoc;
      if (existing) {
        // Update existing document
        excursionDoc = await Excursion.findByIdAndUpdate(existing._id, exc, {
          new: true,
        });
      } else {
        // Generate slug before saving to avoid validation error
        const slug = generateSlug(exc.title);
        // Check if slug already exists and make it unique
        let uniqueSlug = slug;
        let counter = 1;
        while (await Excursion.findOne({ slug: uniqueSlug })) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        // Create new document with slug
        excursionDoc = await new Excursion({ ...exc, slug: uniqueSlug }).save();
      }
      createdExcursions.push(excursionDoc);
      results.excursions++;
    }

    // Insert reviews (create new ones)
    await Review.deleteMany({});
    await Review.insertMany(reviews);
    results.reviews = reviews.length;

    // Insert reels (upsert by title)
    for (const reel of reels) {
      await Reel.findOneAndUpdate({ title: reel.title }, reel, {
        upsert: true,
        new: true,
      });
      results.reels++;
    }

    // Update or create home content
    const existingHome = await Home.findOne();
    if (existingHome) {
      await Home.findOneAndUpdate({}, homeData, { new: true });
    } else {
      await Home.create(homeData);
    }
    results.home = "updated";

    // Seed Bookings
    const now = new Date();
    const dummyBookings = [
      // Accommodation bookings
      {
        bookingType: "accommodation",
        accommodation: createdAccommodations[0]?._id,
        customerName: "John Smith",
        customerEmail: "john.smith@example.com",
        customerPhone: "+1-555-0101",
        checkIn: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checkOut: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        numberOfGuests: 2,
        totalPrice: 450, // 3 nights * 150
        status: "confirmed",
        specialRequests: "Late check-in requested",
      },
      {
        bookingType: "accommodation",
        accommodation: createdAccommodations[1]?._id,
        customerName: "Emily Davis",
        customerEmail: "emily.davis@example.com",
        customerPhone: "+1-555-0102",
        checkIn: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        checkOut: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        numberOfGuests: 3,
        totalPrice: 1120, // 4 nights * 280
        status: "pending",
        specialRequests: "Anniversary celebration",
      },
      {
        bookingType: "accommodation",
        accommodation: createdAccommodations[2]?._id,
        customerName: "Robert Wilson",
        customerEmail: "robert.wilson@example.com",
        customerPhone: "+1-555-0103",
        checkIn: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        checkOut: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        numberOfGuests: 6,
        totalPrice: 1350, // 3 nights * 450
        status: "completed",
        specialRequests: "Family vacation with children",
      },
      // Package bookings
      {
        bookingType: "package",
        package: createdPackages[0]?._id,
        customerName: "Maria Garcia",
        customerEmail: "maria.garcia@example.com",
        customerPhone: "+1-555-0104",
        bookingDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        numberOfGuests: 2,
        totalPrice: 1248, // (599 * 2) + 50 service charge
        status: "confirmed",
        specialRequests: "Vegetarian meal preferences",
      },
      {
        bookingType: "package",
        package: createdPackages[1]?._id,
        customerName: "David Lee",
        customerEmail: "david.lee@example.com",
        customerPhone: "+1-555-0105",
        bookingDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        numberOfGuests: 4,
        totalPrice: 3246, // (799 * 4) + 50 service charge
        status: "pending",
        specialRequests: "Group of friends celebrating",
      },
      {
        bookingType: "package",
        package: createdPackages[2]?._id,
        customerName: "Sophie Martin",
        customerEmail: "sophie.martin@example.com",
        customerPhone: "+1-555-0106",
        bookingDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        numberOfGuests: 2,
        totalPrice: 1848, // (899 * 2) + 50 service charge
        status: "completed",
        specialRequests: "Honeymoon package",
      },
      // Excursion bookings
      {
        bookingType: "excursion",
        excursion: createdExcursions[0]?._id,
        customerName: "James Taylor",
        customerEmail: "james.taylor@example.com",
        customerPhone: "+1-555-0107",
        bookingDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        numberOfGuests: 2,
        totalPrice: 170, // 85 * 2
        status: "confirmed",
        specialRequests: "Prefer evening time slot",
      },
      {
        bookingType: "excursion",
        excursion: createdExcursions[1]?._id,
        customerName: "Anna Brown",
        customerEmail: "anna.brown@example.com",
        customerPhone: "+1-555-0108",
        bookingDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        numberOfGuests: 1,
        totalPrice: 65,
        status: "pending",
        specialRequests: "Beginner hiker, need extra support",
      },
      {
        bookingType: "excursion",
        excursion: createdExcursions[2]?._id,
        customerName: "Michael Johnson",
        customerEmail: "michael.johnson@example.com",
        customerPhone: "+1-555-0109",
        bookingDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        numberOfGuests: 3,
        totalPrice: 225, // 75 * 3
        status: "confirmed",
        specialRequests: "Family with children",
      },
      {
        bookingType: "excursion",
        excursion: createdExcursions[0]?._id,
        customerName: "Sarah Williams",
        customerEmail: "sarah.williams@example.com",
        customerPhone: "+1-555-0110",
        bookingDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        numberOfGuests: 4,
        totalPrice: 340, // 85 * 4
        status: "completed",
        specialRequests: "Group booking",
      },
      {
        bookingType: "accommodation",
        accommodation: createdAccommodations[0]?._id,
        customerName: "Thomas Anderson",
        customerEmail: "thomas.anderson@example.com",
        customerPhone: "+1-555-0111",
        checkIn: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        checkOut: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        numberOfGuests: 1,
        totalPrice: 300, // 2 nights * 150
        status: "cancelled",
        specialRequests: "Business trip",
      },
    ];

    // Clear existing bookings and insert new ones
    await Booking.deleteMany({});
    for (const booking of dummyBookings) {
      // Only create booking if the referenced item exists
      if (
        (booking.bookingType === "accommodation" && booking.accommodation) ||
        (booking.bookingType === "package" && booking.package) ||
        (booking.bookingType === "excursion" && booking.excursion)
      ) {
        await Booking.create(booking);
        results.bookings++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Database seeded successfully",
      results,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return res.status(500).json({
      success: false,
      message: "Error seeding database",
      error: error.message,
    });
  }
}
