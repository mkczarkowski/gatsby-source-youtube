const get = require("lodash/get");
const { createRemoteFileNode } = require("gatsby-source-filesystem");
const crypto = require("crypto");
const polyfill = require("babel-polyfill");

const digest = (str) => crypto.createHash(`md5`).update(str).digest(`hex`);

exports.createGatsbyIds = (items, createNodeId) => {
  return items.map((e) => {
    e.originalID = e.id;
    e.id = createNodeId(e.id.toString());
    return e;
  });
};

exports.normalizeRecords = (items, playlist) => {
  return (items || []).map((item) => {
    const e = {
      id: get(item, "id"),
      publishedAt: get(item, "snippet.publishedAt"),
      title: get(item, "snippet.title"),
      description: get(item, "snippet.description"),
      videoId: get(item, "contentDetails.videoId"),
      privacyStatus: get(item, "status.privacyStatus"),
      channelId: get(item, "snippet.channelId"),
      channelTitle: get(item, "snippet.channelTitle"),
      playlistId: playlist.id,
      playlistTitle: playlist.snippet.title,
      playlistSlug: slugify(playlist.snippet.title),
      thumbnail: get(
        item,
        "snippet.thumbnails.maxres",
        get(
          item,
          "snippet.thumbnails.standard",
          get(
            item,
            "snippet.thumbnails.high",
            get(
              item,
              "snippet.thumbnails.medium",
              get(item, "snippet.thumbnails.default")
            )
          )
        )
      ),
      mqThumbnail: get(item, "snippet.thumbnails.medium"),
    };

    return e;
  });
};

function slugify(string) {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

exports.downloadThumbnails = async ({ items, store, cache, createNode }) =>
  Promise.all(
    items.map(async (item) => {
      let fileNode;
      if (item.mqThumbnail && item.mqThumbnail.url) {
        try {
          fileNode = await createRemoteFileNode({
            url: item.mqThumbnail.url,
            store,
            cache,
            createNode,
          });
        } catch (error) {
          // noop
        }
      }

      if (fileNode) {
        item.localThumbnail___NODE = fileNode.id;
      }

      return item;
    })
  );

exports.createNodesFromEntities = (items, createNode) => {
  items.forEach((e) => {
    let { ...entity } = e;
    let node = {
      ...entity,
      parent: null,
      children: [],
      internal: {
        type: "YoutubeVideo",
        contentDigest: digest(JSON.stringify(entity)),
      },
    };

    createNode(node);
  });
};
