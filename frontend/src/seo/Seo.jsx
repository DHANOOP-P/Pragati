import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  NOINDEX_PREFIXES,
  OG_IMAGE,
  PAGE_SEO,
  SITE_NAME,
  SITE_URL,
} from "./site";

function upsertMeta(key, content, attr = "name") {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const Seo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = PAGE_SEO[pathname] || PAGE_SEO.default;
    const path = pathname === "/" ? "/" : pathname;
    const url = `${SITE_URL}${path}`;
    const hide = NOINDEX_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

    document.title = page.title || DEFAULT_TITLE;
    upsertMeta("description", page.description || DEFAULT_DESCRIPTION);
    upsertMeta("keywords", DEFAULT_KEYWORDS);
    upsertMeta("robots", hide ? "noindex, nofollow" : "index, follow");
    upsertMeta("og:type", "website", "property");
    upsertMeta("og:site_name", SITE_NAME, "property");
    upsertMeta("og:title", page.title || DEFAULT_TITLE, "property");
    upsertMeta("og:description", page.description || DEFAULT_DESCRIPTION, "property");
    upsertMeta("og:url", url, "property");
    upsertMeta("og:image", OG_IMAGE, "property");
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", page.title || DEFAULT_TITLE);
    upsertMeta("twitter:description", page.description || DEFAULT_DESCRIPTION);
    upsertLink("canonical", url);
  }, [pathname]);

  return null;
};

export default Seo;
