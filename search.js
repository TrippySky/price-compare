import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    // data file in project root: ./data/sample_listings.json
    const filePath = path.join(process.cwd(), "data", "sample_listings.json");
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ ok: false, error: "sample_listings.json not found in ./data" });
    }
    const raw = fs.readFileSync(filePath, "utf8");
    const listings = JSON.parse(raw);
    const { city = "Sydney" } = req.query;
    const filtered = listings.filter(it => it.city && it.city.toLowerCase() === String(city).toLowerCase());
    const normalized = filtered.map(item => {
      const total = Number(item.price_per_night_aud || 0) + Number(item.fees || 0);
      return {
        id: item.id,
        title: item.title,
        city: item.city,
        rating: item.rating,
        thumbnail: item.thumbnail,
        competitor_price_aud: total,
        our_price_aud: +(total * 0.95).toFixed(2),
        source: item.source || "seed"
      };
    });
    normalized.sort((a,b) => a.our_price_aud - b.our_price_aud);
    res.status(200).json({ ok: true, count: normalized.length, results: normalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
}
