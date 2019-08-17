const axios = require("axios");
const get = require("lodash/get");
const normalize = require("./normalize");
const polyfill = require("babel-polyfill");

function getApi() {
  const rateLimit = 500;
  let lastCalled = null;

  const rateLimiter = (call) => {
    const now = Date.now();
    if (lastCalled) {
      lastCalled += rateLimit;
      const wait = lastCalled - now;
      if (wait > 0) {
        return new Promise((resolve) => setTimeout(() => resolve(call), wait));
      }
    }
    lastCalled = now;
    return call;
  };

  const api = axios.create({
    baseURL: "https://www.googleapis.com/youtube/v3/",
  });

  api.interceptors.request.use(rateLimiter);

  return api;
}

exports.sourceNodes = async (
  { boundActionCreators, store, cache, createNodeId },
  { channelId, apiKey, maxVideos = 50 }
) => {
  const { createNode } = boundActionCreators;
  let api = getApi();
  const playlistResp = await api.get(
    `playlists?part=snippet&channelId=${channelId}&key=${apiKey}`
  );

  const playlists = [...playlistResp.data.items];

  const createVideoNodesFromPlaylist = async (playlist, apiKey) => {
    var api = getApi();
    let videos = [];

    let pageSize = Math.min(50, maxVideos);

    let videoResp = await api.get(
      `playlistItems?part=snippet%2CcontentDetails%2Cstatus&maxResults=${pageSize}&playlistId=${playlist.id}&key=${apiKey}`
    );
    videos.push(...videoResp.data.items);

    while (videoResp.data.nextPageToken && videos.length < maxVideos) {
      pageSize = Math.min(50, maxVideos - videos.length);
      let nextPageToken = videoResp.data.nextPageToken;
      videoResp = await api.get(
        `playlistItems?part=snippet%2CcontentDetails%2Cstatus&maxResults=${pageSize}&pageToken=${nextPageToken}&playlistId=${playlist.id}&key=${apiKey}`
      );
      videos.push(...videoResp.data.items);
    }

    videos = normalize.normalizeRecords(videos, playlist);
    videos = normalize.createGatsbyIds(videos, createNodeId);
    videos = await normalize.downloadThumbnails({
      items: videos,
      store,
      cache,
      createNode,
    });
    normalize.createNodesFromEntities(videos, createNode);

    return;
  };

  try {
    await Promise.all(
      playlists.map(async (playlist) =>
        createVideoNodesFromPlaylist(playlist, apiKey)
      )
    );
    return;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
