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

***Move to static-page branch*** 

Here you will see here that the behaviour of the page remains the same, it will still show the time response from build time.

When going to /api/dynamic now you will see that we access the headers there, which makes the route dynamic. When visting this in the browser you will see that the response now changes with every refresh.