// Public asset path that works both at the site root (dev, own domain) and
// under a sub path like GitHub Pages (/fietsenmaker/). Node scripts that
// import data files have no import.meta.env, so fall back to "/".
const BASE = import.meta.env?.BASE_URL ?? "/";

export const asset = (path) => BASE + path.replace(/^\//, "");
