import connectToDatabase from "../lib/mongodb";
import About from "../models/About";

// Get about content
export const getAbout = async (req, res) => {
  try {
    await connectToDatabase();

    let about = await About.findOne();

    // If no about content exists, return default structure
    if (!about) {
      about = {
        heroTitle: "About Lonuhiri",
        heroDescription: "Creating unforgettable memories since 2010",
        heroImage: "/luxury-guest-house-exterior-pool.jpg",
        storyTitle: "Our Story",
        storyContent:
          "Lonuhiri was born from a dream to create a sanctuary where travelers could escape the ordinary and embrace the extraordinary.\n\nOver the years, we've welcomed thousands of guests from around the world, each leaving with memories that last a lifetime.\n\nEvery room, every meal, and every experience is crafted with love.",
        storyImage: "/luxury-hotel-room-bed.jpg",
        valuesTitle: "Our Values",
        valuesDescription: "The principles that guide everything we do",
        values: [
          {
            icon: "Heart",
            title: "Genuine Hospitality",
            description: "We treat every guest like family, ensuring their comfort and satisfaction is our top priority.",
          },
          {
            icon: "Award",
            title: "Excellence",
            description: "We strive for perfection in every detail, from our accommodations to our service.",
          },
          {
            icon: "Globe",
            title: "Sustainability",
            description: "We are committed to protecting our environment and supporting local communities.",
          },
          {
            icon: "Users",
            title: "Community",
            description: "We believe in building strong relationships with our guests and local community.",
          },
        ],
        ctaTitle: "Ready to Experience Paradise?",
        ctaDescription: "Your perfect getaway awaits.",
        ctaButtonText: "Book Your Stay",
        ctaButtonLink: "#",
      };
    }

    res.status(200).json({
      success: true,
      data: about,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update about content
export const updateAbout = async (req, res) => {
  try {
    await connectToDatabase();

    let about = await About.findOne();

    if (!about) {
      // Create new about content if it doesn't exist
      about = await About.create(req.body);
    } else {
      // Update existing about content
      about = await About.findOneAndUpdate({}, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      data: about,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

