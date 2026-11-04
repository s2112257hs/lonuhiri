import Home from "../models/Home.js";

// Get home content
export const getHome = async (req, res) => {
  try {
    const home = await Home.findOne();
    if (!home) {
      return res.status(404).json({ message: "Home content not found" });
    }
    res.json(home);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create home content
export const createHome = async (req, res) => {
  try {
    const { banner, heroTitle, heroDescription, aboutSectionImage } = req.body;

    // Check if home content already exists
    const existingHome = await Home.findOne();
    if (existingHome) {
      return res
        .status(400)
        .json({ message: "Home content already exists. Use PUT to update." });
    }

    const home = new Home({
      banner,
      heroTitle,
      heroDescription,
      aboutSectionImage,
    });

    const savedHome = await home.save();
    res.status(201).json(savedHome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update home content
export const updateHome = async (req, res) => {
  try {
    const { banner, heroTitle, heroDescription, aboutSectionImage } = req.body;
    const update = {};

    if (banner !== undefined) {
      if (banner.type !== undefined) update["banner.type"] = banner.type;
      if (banner.url !== undefined) update["banner.url"] = banner.url;
    }
    if (heroTitle !== undefined) update.heroTitle = heroTitle;
    if (heroDescription !== undefined) update.heroDescription = heroDescription;
    if (aboutSectionImage !== undefined)
      update.aboutSectionImage = aboutSectionImage;

    const savedHome = await Home.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.json(savedHome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
