# gatsby-source-youtube

A [gatsby](https://www.gatsbyjs.org/) source plugin for fetching videos from a list of Youtube channels using their channel IDs.

Learn more about Gatsby plugins and how to use them here: https://www.gatsbyjs.org/docs/plugins/

## Install

Add to your package.json deps

`"gatsby-source-youtube": "https://github.com/mkczarkowski/gatsby-source-youtube.git",`

## gatsby-config.js

```javascript
plugins: [
  {
    resolve: `gatsby-source-youtube`,
    options: {
      channelId: ['<< Array of Youtube channelIDs>>',
      apiKey: '<< Add your Youtube api key here>>',
      maxVideos: 50 // Defaults to 50
    },
  },
  ...
]
```

## Examples of how to query:

Get all the videos:

```graphql
{
  allYoutubeVideo {
    edges {
      node {
        id
        title
        description
        videoId
        publishedAt
        privacyStatus
        channelTitle
      }
    }
  }
}
```

Get videos from a specific channel:

```graphql
{
  allYoutubeVideo(filter: {channelId: {eq: "UCK8sQmJBp8GCxrOtXWBpyEA"}}) {
    edges {
      node {
        id
        title
        description
        videoId
        publishedAt
        privacyStatus
        channelTitle
      }
    }
  }
}
```

## Schema

`title`
: The title of the Youtube video

`description`
: The description of the Youtube video

`videoId`
: The id for the video on Youtube, can be used to make a url to the video or to embed it

`publishedAt`
: The date the video was published.

`privacyStatus`
: The privacy status of the video, public, private, or unlisted

`thumbnail`
: The information about the largest thumbnail available on Youtube. Sub-properties: `url`, `width`, `height`

`localThumbnail`
: The information about the locally saved thumbnail. Works with `gatsby-image`

`channelId`
: The channel id of the Youtube video

`channelTitle`
: The title of the channel of the Youtube video

`playlistId`
: The playlist id of the Youtube video

`playlistTitle`
: The title of the playlist of the Youtube video

`playlistSlug`
: The slugified playlist title of the Youtube video
