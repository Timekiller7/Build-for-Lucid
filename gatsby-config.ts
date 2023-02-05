import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `cogito`,
  },
  plugins: [`gatsby-plugin-postcss`],
  pathPrefix: "/cogito",
};

export default config;
