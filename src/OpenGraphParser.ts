import { decode } from 'html-entities';

interface MetaData {
  [key: string]: string;
}

interface FetchOptions {
  fallbackOnHTMLTags: boolean;
}

function findOGTags(content: string, url: string): MetaData {
  const metaTagOGRegex =
    /<meta[^>]*(?:property=[ '"]*og:([^'"]*))?[^>]*(?:content=["]([^"]*)["])?[^>]*>/gi;
  const matches = content.match(metaTagOGRegex);
  const meta: MetaData = {};

  if (matches) {
    const metaPropertyRegex = /<meta[^>]*property=[ "]*og:([^"]*)[^>]*>/i;
    const metaContentRegex = /<meta[^>]*content=[ "]([^"]*)[^>]*>/i;

    for (let i = matches.length; i--; ) {
      let propertyMatch;
      let contentMatch;
      let metaName;
      let metaValue;

      try {
        propertyMatch = metaPropertyRegex.exec(matches[i] || '');
        contentMatch = metaContentRegex.exec(matches[i] || '');

        if (!propertyMatch || !contentMatch) {
          continue;
        }

        metaName = propertyMatch[1]?.trim();
        metaValue = contentMatch[1]?.trim();

        if (!metaName || !metaValue) {
          continue;
        }
      } catch (e) {
        if (__DEV__) {
          console.log('Error on ', matches[i]);
          console.log('propertyMatch', propertyMatch);
          console.log('contentMatch', contentMatch);
          console.log(e);
        }

        continue;
      }

      if (metaValue.length > 0) {
        if (metaValue[0] === '/') {
          if (metaValue.length <= 1 || metaValue[1] !== '/') {
            if (url[url.length - 1] === '/') {
              metaValue = url + metaValue.substring(1);
            } else {
              metaValue = url + metaValue;
            }
          } else {
            // handle protocol agnostic meta URLs
            if (url.indexOf('https://') === 0) {
              metaValue = `https:${metaValue}`;
            } else if (url.indexOf('http://') === 0) {
              metaValue = `http:${metaValue}`;
            }
          }
        }
      } else {
        continue;
      }

      meta[metaName] = decode(metaValue);
    }
  }

  return meta;
}

function findHTMLMetaTags(content: string, url: string): MetaData {
  const metaTagHTMLRegex =
    /<meta(?:[^>]*(?:name|itemprop)=[ '"]([^'"]*))?[^>]*(?:[^>]*content=["]([^"]*)["])?[^>]*>/gi;
  const matches = content.match(metaTagHTMLRegex);
  const meta: MetaData = {};

  if (matches) {
    const metaPropertyRegex = /<meta[^>]*(?:name|itemprop)=[ "]([^"]*)[^>]*>/i;
    const metaContentRegex = /<meta[^>]*content=[ "]([^"]*)[^>]*>/i;

    for (let i = matches.length; i--; ) {
      let propertyMatch;
      let contentMatch;
      let metaName;
      let metaValue;

      try {
        propertyMatch = metaPropertyRegex.exec(matches[i] || '');
        contentMatch = metaContentRegex.exec(matches[i] || '');

        if (!propertyMatch || !contentMatch) {
          continue;
        }

        metaName = propertyMatch[1]?.trim();
        metaValue = contentMatch[1]?.trim();

        if (!metaName || !metaValue) {
          continue;
        }
      } catch (e) {
        if (__DEV__) {
          console.log('Error on ', matches[i]);
          console.log('propertyMatch', propertyMatch);
          console.log('contentMatch', contentMatch);
          console.log(e);
        }

        continue;
      }

      if (metaValue.length > 0) {
        if (metaValue[0] === '/') {
          if (metaValue.length <= 1 || metaValue[1] !== '/') {
            if (url[url.length - 1] === '/') {
              metaValue = url + metaValue.substring(1);
            } else {
              metaValue = url + metaValue;
            }
          } else {
            // handle protocol agnostic meta URLs
            if (url.indexOf('https://') === 0) {
              metaValue = `https:${metaValue}`;
            } else if (url.indexOf('http://') === 0) {
              metaValue = `http:${metaValue}`;
            }
          }
        }
      } else {
        continue;
      }

      meta[metaName] = decode(metaValue);
    }

    if (!meta.title) {
      const titleRegex = /<title>([^>]*)<\/title>/i;
      const titleMatch = content.match(titleRegex);

      if (titleMatch) {
        meta.title = decode(titleMatch[1]);
      }
    }
  }

  return meta;
}

function parseMeta(html: string, url: string, options: FetchOptions): MetaData {
  let meta = findOGTags(html, url);

  if (options.fallbackOnHTMLTags) {
    try {
      meta = {
        ...findHTMLMetaTags(html, url),
        ...meta,
      };
    } catch (e) {
      if (__DEV__) {
        console.log('Error in fallback', e);
      }
    }
  }

  return meta;
}

async function fetchHtml(
  urlToFetch: string,
  forceGoogle = false
): Promise<string | null> {
  let result;

  let userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';

  if (forceGoogle) {
    userAgent =
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
  }

  try {
    result = await fetch(urlToFetch, {
      method: 'GET',
      headers: {
        'user-agent': userAgent,
      },
    });

    if (result.status >= 400) {
      throw result;
    }

    return result.text().then((resultParsed) => resultParsed);
  } catch (e) {
    if (__DEV__) {
      if (e instanceof Error && e.message === 'Network request failed') {
        console.log(urlToFetch, 'could not be fetched');
      } else {
        console.error('Fetch Error:', e);
      }
    }
    return null;
  }
}

async function fetchJSON(
  urlToFetch: string,
  urlOfVideo: string
): Promise<MetaData | null> {
  try {
    const result = await fetch(urlToFetch, { method: 'GET' });

    if (result.status >= 400) {
      throw result;
    }

    const resultParsed = await result.json();

    return {
      title: resultParsed.title,
      image: resultParsed.thumbnail_url,
      url: urlOfVideo,
    };
  } catch (e) {
    if (__DEV__) {
      console.log(e);
    }
    return null;
  }
}

function getUrls(contentToMatch: string): string[] {
  const regexp =
    /(?:(?=[\s`!()\[\]{};:'".,<>?«»“”‘’])|\b)((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/|[a-z0-9.\-]+[.](?:com|org|net))(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))*(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]|\b))/gi;
  const urls = contentToMatch.match(regexp);

  if (urls && urls.length) {
    const urlsToReturn = urls.map((url) => {
      return url.toLowerCase().indexOf('http') === 0 ? url : `http://${url}`;
    });

    return urlsToReturn;
  } else {
    if (__DEV__) {
      console.log('Could not find an html link');
    }
  }

  return [];
}

async function extractMeta(
  textContent = '',
  options: FetchOptions = { fallbackOnHTMLTags: true }
): Promise<MetaData[]> {
  try {
    const urls = getUrls(textContent);

    const metadataPromise = urls.map(
      async (url): Promise<MetaData | undefined> => {
        if (url.indexOf('youtube.com') >= 0) {
          const data = await fetchJSON(
            `https://www.youtube.com/oembed?url=${url}&format=json`,
            url
          );
          if (data) {
            return data;
          }
        } else {
          const html = await fetchHtml(url);
          if (html) {
            const data = {
              ...(html ? parseMeta(html, url, options) : {}),
              url,
            };
            return data;
          }
        }
        return undefined;
      }
    );

    const metadata = (await Promise.all(metadataPromise)).filter(
      (data): data is MetaData => !!data
    );

    return metadata;
  } catch (e) {
    console.log(e);

    return [];
  }
}

export default {
  extractMeta,
  findOGTags,
  findHTMLMetaTags,
};
