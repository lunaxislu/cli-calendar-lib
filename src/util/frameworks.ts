export const FRAMEWORKS = {
  "next-app": {
    name: "app-router",
    isRsc: true,
  },
  "next-pages": {
    name: "pages-router",
    isRsc: false,
  },

  "react.js": {
    name: "react",
    isRsc: false,
  },
} as const;

export type Framework = (typeof FRAMEWORKS)[keyof typeof FRAMEWORKS];
