// URL params for development and automated checks:
//   ?debug=1          draw hitboxes (roads, doors, exits) in every world
//   ?world=launchpad  start in a specific world
//   ?game=theater     open a game directly
//   ?launch=1         play the rocket launch right away (on the launchpad)
//   ?touch=1          show the touch joystick on a desktop browser
const params = typeof location !== "undefined"
  ? new URLSearchParams(location.search)
  : new URLSearchParams();

export const DEBUG = params.has("debug");
export const START_WORLD = params.get("world");
export const START_GAME = params.get("game");
export const START_LAUNCH = params.has("launch");
export const START_TOUCH = params.has("touch");
