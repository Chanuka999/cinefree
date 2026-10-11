import Media from "../models/Media.js";

import { tmdbRequest, imageUrl } from "../config/tmdb.js";

function normalizeMedia(item, type) {
  const isMovie = type === "movie";

  return {
    id: `${type}-${item.id}`,
    tmdbId: item.id,
    slug: `${type}-${item.id}`,
    title: isMovie ? item.title : item.name,
    type,
    year: Number(
      (isMovie ? item.release_date : item.first_air_date)?.slice(0, 4)
    ) || null,
    rating: Number(item.vote_average?.toFixed(1) || 0),
    genreIds: item.genre_ids || [],
    genre: [],
    description: item.overview || "No description available.",
    poster: imageUrl(item.poster_path, "w500"),
    backdrop: imageUrl(item.backdrop_path, "w1280"),
    videoUrl: "",
    downloadUrl: "",
    rights: "Metadata provided by TMDB. Video rights must be verified separately.",
  };
}

export async function getMedia(req, res, next) {
  try {
    const type = req.query.type || "movie";
    const category = req.query.category || "popular";
    const page = Math.max(1, Math.min(500, Number(req.query.page) || 1));
    const search = String(req.query.search || "").trim();

    if (!["movie", "series", "all"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media type",
      });
    }

    const endpointFor = (mediaType) => {
      const prefix = mediaType === "movie" ? "/movie" : "/tv";

      if (search) return `/search/${mediaType === "movie" ? "movie" : "tv"}`;
      if (category === "trending") return `/trending/${mediaType === "movie" ? "movie" : "tv"}/week`;

      return `${prefix}/popular`;
    };

    const types = type === "all" ? ["movie", "series"] : [type];

    const responses = await Promise.all(
      types.map(async (mediaType) => {
        const apiType = mediaType === "series" ? "tv" : "movie";
        const data = await tmdbRequest(endpointFor(mediaType), {
          language: "en-US",
          page,
          query: search || undefined,
        });

        return (data.results || []).map((item) =>
          normalizeMedia(item, apiType === "tv" ? "series" : "movie")
        );
      })
    );

    const results = responses.flat();

    res.json({
      success: true,
      page,
      totalPages: Math.max(
        0,
        ...responses.map((_, index) => 0),
      ),
      results,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMediaDetails(req, res, next) {
  try {
    const { type, id } = req.params;

    if (!["movie", "series"].includes(type) || !/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media type or ID",
      });
    }

    const apiType = type === "series" ? "tv" : "movie";

    const [item, credits, videos] = await Promise.all([
      tmdbRequest(`/${apiType}/${id}`, { language: "en-US" }),
      tmdbRequest(`/${apiType}/${id}/credits`),
      tmdbRequest(`/${apiType}/${id}/videos`),
    ]);

    const normalized = normalizeMedia(item, type);
    // Video URLs are stored separately from TMDB metadata. Only use records
    // explicitly added to our own media collection.
    const source = await Media.findOne({ tmdbId: Number(id), type, published: true }).lean();

    res.json({
      success: true,
      result: {
        ...normalized,
        embedUrl: source?.embedUrl || "",
        videoUrl: source?.videoUrl || "",
        downloadUrl: source?.downloadUrl || "",
        videoProvider: source?.videoProvider || "",
        rights: source?.rights?.status
          ? `Video rights status: ${source.rights.status}`
          : normalized.rights,
        genres: item.genres?.map((genre) => genre.name) || [],
        runtime: item.runtime || null,
        numberOfSeasons: item.number_of_seasons || 0,
        numberOfEpisodes: item.number_of_episodes || 0,
        seasons: (item.seasons || [])
          .filter((season) => season.season_number > 0)
          .map((season) => ({
            number: season.season_number,
            name: season.name,
            episodeCount: season.episode_count,
          })),
        cast: (credits.cast || []).slice(0, 10).map((person) => ({
          name: person.name,
          character: person.character,
          profile: imageUrl(person.profile_path, "w185"),
        })),
        trailer:
          videos.results?.find(
            (video) => video.site === "YouTube" && video.type === "Trailer"
          )?.key || null,
      },
    });
  } catch (error) {
    next(error);
  }
}
