# Cache Documentation NextJS App Router

This project aims to shed some light, with practical examples, on how the caching mechanism in nextjs (version > 13.5 & < 15) app router works. 

This is specific for self-hosted instances of NextJS.

## How caching works

The answer to this question is dependent on the type of the path/route we are accessing.

### Static Routes/Paths

> **Observation**
>> From this point on we will be referring to the production built version of the app. In development mode, even the static paths do not use caching, but make new requests every time

***Move to the static branch***

A Static Route/Path caches the response of any API call it makes at application *BUILD* time - i.e. when `next build` is run.

To build the static version of the app, you'll need to do a hack. You will have to have the dev server running on port 3000, and only then you can run the build command (this is because at build time the fetch to the api is actually being triggered, but if the app is not running on the port specified, the fetch will result in an error)

If you build the app and start it, then visit `http://localhost:3000/static` or `http://localhost:3000/api/static`, you will see that no matter what you try - refresh, hard refresh, close & reopen browser, open icognito tab, the date will remain the same and will be the one retrieved at build time.


### Static Path & Dynamic Route

> ### How to opt out of static rendering?
>> 1.**Use the `dynamic` export**:
You can add the following export to your page component to force dynamic rendering:
```typescript
export const dynamic = 'force-dynamic'
```
>>This tells Next.js to render the page on every request, bypassing static generation.
2.**Use a dynamic route segment**:
If your page uses dynamic route segments (e.g., `[id]` in the file name), it will be rendered dynamically by default unless you provide `generateStaticParams`.
3.**Use `cookies()`, `headers()`, or `searchParams`**:
If your page component uses any of these functions from `next/headers`, it will automatically opt out of static rendering.
4.**Use dynamic functions**:
Certain functions like `redirect()` or `notFound()` will cause the page to be dynamically rendered.
5.`let data = await fetch('https://api.vercel.app/blog', { cache: 'no-store' })`

***Move to static-page branch*** 

Here you will see here that the behaviour of the page remains the same, it will still show the time response from build time.

When going to /api/dynamic in code now you will see that we access the headers there, which makes the route dynamic. When visting this in the browser you will see that the response now changes with every refresh.

### Dynamic Path & Dynamic Route

This is our most encoutered use cases in Carry1st Gateway project. 
We use this paradigm when queries are related to users - i.e. user private data, or requests use authorization headers etc. 

The default behaviour of a dynamic path is to always make a new request. You can check this behaviour on the `dynamic-only` branch. Whenever we go in the browser to `/dynamic-1` or `/dynamic-2` we will see a new response rendered if we refresh.

**SURPRISE:** What happens when we navigate with Link? We get a ***cached*** response!! 

**WHY?** because there are **TWO** kinds of caching: Data Cache and something called Client Cache. This Client cache is used whenever a *soft* navigation happens inside our application.

The `<Link>` component performs a soft navigation, while `<a>` is a hard navigation, which triggers a new request. The soft navigation also will trigger a new request if the default interval of 30 seconds, in which the client cache is considered active, hasn't passed. Try to do a soft navigation after 30 seconds and you will see that the response is now brand new.

***Truly Dynamic Path:*** to make the paths actually dynamic we need to change this config in `next.config.mjs`:
```
experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
```

This sets the interval of marking the client cache as stale to 0, so effectively no client cache will be used. The default is 30.

### Dynamic Paths with Cache Usage

We can still opt in into the Data Cache option if we need to. There are two versions of revalidation for this:
* Time Based
This is added by adding the following revalidate option to your fetches:
```
await fetch("http://localhost:3000/api/dynamic", {
    next: { revalidate: 10 },
    headers: {
      "Content-Type": "application/json",
    },
  });
```

The behaviour this has is the following:

1. first request is made at time X, a response is received and saved to data cache
2. second request comes in at time X+n, n < 10; the response is straight taken from data cache, no updating of cache is done
3. third request comes in after X+m, m > 10; the response is **STILL** taken from cache, but the data is now STALE. Since it's STALE a request will be done and the Data Cahce will be updated with the new value, BUT the client will still receive the old cached value
4. forth request comes in, and now receives the new response stored in Data Chace by the third request.

[Image describing this in the NextJS docs](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Ftime-based-revalidation.png&w=3840&q=75)

***IMO*** this is not good behaviour, and we should have a way to know that a cached response is stale and not return it to the client.

***Demonstration***

When first going to `dynamic-1` page you will be served the last cached response if there exists (even if this is 300 years old!!!). Only after a refresh, you will see the new data in the client.
If you navigate (hard or soft) between `dynamic-1` and `dynamic-2` in the course of 10 seconds, the response will be same. The paths make the same fetch call, so they share the cache.

Then at a new (hard or soft) navigation to `dynamic-1/2` after 10 seconds, you will STILL see the old response, BUT now a new request is done and the Data Cache is updayed. With a refresh or a new navigation, we will now see the updated response.

But in these 10 seconds if you navigate to `dynamic-auth`, even though the fetch seems to be the same, you will see a new response. 
The `dynamic-auth` path has a separate cache. *WHY?* because it has a different header, the Authorization one. For every differnce of fetch requests (even different values of headers, cookies, etc), the cache will be separate.

> **Observation**
Client Cache still works if we don't override its defaults

> ***Observation 2***
You might see in some old docs or in stackoverflow answers that you can set the revalidation period of a path by using `export const revalidate = 10;` from the page.tsx file. This is not true, this doesn't do anything. At least not in the dynamic paradigm.

### On Demand Revalidation

There is another revalidation pattern, called **On Demand Revalidation**, trough which we can programatically revalidate caches for requests. This is typically used when we make mutations and we know for sure that the UI should be updated to reflect these mutations.

There are 2 types:
- path revalidation: `revalidatePath("/path")` - revalidates the entire /path
- tag revalidation: `revalidateTag("some-tag")` - revalidates the cache of the request marked with this tag

***For Demonstration*** move to branch on-demand-revalidation
When adding todos, you will see that they get instantly added to the list. 
You can disable (comment) the lines which trigger revalidations and see what happens. The list will not be updated instantly anymore, you will have to navigate or refresh to see the changes.


### On Demand Revalidation with Cahce

If we introduce caching with on demand revalidation, things get trickier, and a little unintuitive.

***Demo*** go to on-demand-with-cache branch.

Here we've added time based revalidation to the fetch requests.

It seems that the path revalidation is not taken into account anymore. The behaviour is the same as for the time based revalidation: i.e. cache response is updated only after 10s

The tag revalidation mechanism still works as expected, the new todos being shown instantly.


### Fixing the Time Based Revalidation

Ideally what we want is that the user never sees STALE data and their requests are cached for a small amount of time ( < 5 mins, this makes sense for the gateway project). With default nextjs time based caching mechanism, there is no way to actually ensure fresh data.

Solution: use a default cache-handler, which overrides the cache handler from next. 

Since we're not deploying on Vercel, our cache is saved to disk. If we have more pods, the cache isn't even shared between them :(.

I've added the following [library](https://caching-tools.github.io/next-shared-cache), which provides an implementation of the local cache that is more deterministic.

For this we introduced the `cache-handler.mjs` file and some changes to the `next.config.mjs` file. 

***Demo*** go to branch dynamic-cache-fixed and observe the behaviour:
- navigating to `/dynamic-1` will render a new response
- all refreshes or navigations within 10 seconds to `/dynamic-2` will render the same result
- a new navigation or refresh after 10 seconds will render a new result
- as previously, the `/dynamic-auth` has a separate cache since it has different headers than first 2 paths.

>***Observation***
In the next.config we also configured the stale time, without this, the dynamic paths will still show the same response on *SOFT* navigations.