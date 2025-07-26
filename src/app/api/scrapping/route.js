import puppeteer from "puppeteer";

export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const urlParam = params.get("url");

  try {
    const urlObj = new URL(urlParam);
    const url = urlObj.href;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36"
    );

    await page.exposeFunction("onClientNavigation", (url) => {
      console.log("Soft navigated to:", url);
      // Trigger reload or media scan again
    });

    page.on("framenavigated", (frame) => {
      console.log("Hard navigation:", frame.url());
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    await page.evaluate(() => {
      const pushState = history.pushState;
      history.pushState = function (...args) {
        window.onClientNavigation(location.href);
        return pushState.apply(history, args);
      };

      const replaceState = history.replaceState;
      history.replaceState = function (...args) {
        window.onClientNavigation(location.href);
        return replaceState.apply(history, args);
      };

      window.addEventListener("popstate", () => {
        window.onClientNavigation(location.href);
      });

      const proxyOrigin = "http://localhost:3000/api/proxy?url=";

      document.querySelectorAll("[src], [href]").forEach((el) => {
        const attr = el.hasAttribute("src") ? "src" : "href";
        const val = el.getAttribute(attr);

        if (val && !val.startsWith("/api/proxy")) {
          try {
            const url = new URL(val, window.location.origin);
            el.setAttribute(attr, proxyOrigin + encodeURIComponent(url.href));
          } catch {}
        }
      });
    });

    const html = await page.content();

    await browser.close();
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
};
