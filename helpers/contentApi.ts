import type { Asset, ContentfulClientApi } from 'contentful'
import { createClient } from 'contentful'
import { ISiteFields, IGameFields } from 'types/generated/contentful'

let client: ContentfulClientApi

function getOrCreateClient() {
  if (client == undefined) {
    if (process.env.CONTENTFUL_SPACE_ID == undefined) {
      throw 'Environment variable CONTENTFUL_SPACE_ID is not defined!'
    }
    if (process.env.CONTENTFUL_DELIVERY_API_ACCESS_TOKEN == undefined) {
      throw 'Environment variable CONTENTFUL_DELIVERY_API_ACCESS_TOKEN is not defined!'
    }
    client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID,
      accessToken: process.env.CONTENTFUL_DELIVERY_API_ACCESS_TOKEN
    })
  }
  return client
}

function parseSiteData(fields: ISiteFields): SiteData {
  return {
    ...fields,
    author: fields.author.fields
  } as SiteData
}

function parseGameData(fields: IGameFields): GameData {
  return {
    ...fields,
    image: parseImageData(fields.image)
  } as GameData
}

function parseImageData(image: Asset): ImageAssetData {
  return {
    url: `https:${image.fields.file.url}`,
    width: image.fields.file.details.image?.width,
    height: image.fields.file.details.image?.height
  } as ImageAssetData
}

export async function getSiteData(): Promise<SiteData> {
  const entries = await getOrCreateClient().getEntries<ISiteFields>({
    content_type: 'site'
  })
  return parseSiteData(entries.items[0].fields)
}

export async function getGameData(slug: string): Promise<GameData> {
  const entries = await getOrCreateClient().getEntries<IGameFields>({
    content_type: 'game',
    'fields.slug': slug
  })
  return parseGameData(entries.items[0].fields)
}

export async function getAllGameData(): Promise<GameData[]> {
  const entries = await getOrCreateClient().getEntries<IGameFields>({
    content_type: 'game'
  })
  return entries.items.map(x => parseGameData(x.fields))
}
