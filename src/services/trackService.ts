import { tracks, Track } from "../data/tracks";

/**
 * Get tracks filtered by user's branch
 * If no branch provided, returns all tracks
 */
export const getTracksByBranch = (branchId?: string): Track[] => {
  if (!branchId) {
    return tracks;
  }

  return tracks.filter((track) => track.branches.includes(branchId));
};

/**
 * Get a single track by ID
 */
export const getTrackById = (trackId: string): Track | undefined => {
  return tracks.find((t) => t.id === trackId);
};

/**
 * Get courses for a specific track
 */
export const getCoursesByTrackId = (trackId: string) => {
  const track = getTrackById(trackId);
  return track?.courses || [];
};

/**
 * Get all tracks that a branch has access to
 */
export const getBranchTracks = (branchId: string): Track[] => {
  return getTracksByBranch(branchId);
};

/**
 * Search tracks by title or description
 */
export const searchTracks = (query: string, branchId?: string): Track[] => {
  const tracksList = getTracksByBranch(branchId);
  const lowerQuery = query.toLowerCase();

  return tracksList.filter(
    (track) =>
      track.title.toLowerCase().includes(lowerQuery) ||
      track.description.toLowerCase().includes(lowerQuery)
  );
};
