const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    injectProfile: "./src/inject/injectProfile.ts",
    injectTimeline: "./src/inject/injectTimeline.ts",
    background: "./src/background/background.ts",
  },
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(__dirname, "./extension"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
};
