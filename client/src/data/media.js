
const poster = () => "/image/im1.png";

export const media = [
  {
    id: "movie-1",
    slug: "ocean-of-stars",
    title: "Ocean of Stars",
    type: "movie",
    year: 2025,
    rating: 8.6,
    genre: ["Adventure", "Sci-Fi"],
    description:
      "A daring crew travels beyond the edge of the known universe in search of a new home.",
    poster: poster("photo-1446776811953-b23d57bd21aa"),
    backdrop: poster("photo-1462331940025-496dfbfc7564"),
    videoUrl: "",
    downloadUrl: "",
    rights: "Demo content — replace with verified licensed media.",
    featured: true,
  },
  {
    id: "movie-2",
    slug: "the-last-frontier",
    title: "The Last Frontier",
    type: "movie",
    year: 2024,
    rating: 8.1,
    genre: ["Drama", "Adventure"],
    description:
      "An explorer discovers an extraordinary world hidden beyond the mountains.",
    poster: poster("photo-1464822759023-fed622ff2c3b"),
    backdrop: poster("photo-1470770841072-f978cf4d019e"),
    videoUrl: "",
    downloadUrl: "",
    rights: "Demo content — replace with verified licensed media.",
  },
  {
    id: "movie-3",
    slug: "silent-world",
    title: "Silent World",
    type: "movie",
    year: 2023,
    rating: 7.9,
    genre: ["Mystery", "Drama"],
    description:
      "A quiet town holds a secret that changes everything for a young investigator.",
    poster: poster("photo-1519608487953-e999c86e7455"),
    backdrop: poster("photo-1500530855697-b586d89ba3ee"),
    videoUrl: "",
    downloadUrl: "",
    rights: "Demo content — replace with verified licensed media.",
  },
  {
    id: "series-1",
    slug: "hidden-kingdom",
    title: "Hidden Kingdom",
    type: "series",
    year: 2025,
    rating: 9.0,
    genre: ["Fantasy", "Adventure"],
    description:
      "A young hero discovers a forgotten kingdom and a mysterious ancient power.",
    poster: poster("photo-1518709268805-4e9042af9f23"),
    backdrop: poster("photo-1511497584788-876760111969"),
    seasons: [
      {
        number: 1,
        episodes: [
          {
            number: 1,
            title: "The Beginning",
            videoUrl: "",
            downloadUrl: "",
          },
          {
            number: 2,
            title: "Into the Forest",
            videoUrl: "",
            downloadUrl: "",
          },
          {
            number: 3,
            title: "The Lost Map",
            videoUrl: "",
            downloadUrl: "",
          },
        ],
      },
      {
        number: 2,
        episodes: [
          {
            number: 1,
            title: "A New Journey",
            videoUrl: "",
            downloadUrl: "",
          },
        ],
      },
    ],
    rights: "Demo content — replace with verified licensed media.",
  },
  {
    id: "series-2",
    slug: "city-after-dark",
    title: "City After Dark",
    type: "series",
    year: 2024,
    rating: 8.3,
    genre: ["Crime", "Drama"],
    description:
      "A detective follows a trail of clues through a city full of secrets.",
    poster: poster("photo-1519608487953-e999c86e7455"),
    backdrop: poster("photo-1519501025264-65ba15a82390"),
    seasons: [],
    rights: "Demo content — replace with verified licensed media.",
  },
];

export const genres = [
  "All",
  "Action",
  "Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Mystery",
  "Sci-Fi",
];
