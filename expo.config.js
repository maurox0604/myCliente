import { getDefaultConfig } from 'expo/metro-config';

export default {
  name: "ice-queen-app-name",
  slug: "ice-queen-app-slug",
  platforms: ["web"],
  web: {
    bundler: "metro", // Asegúrate de que bundler sea metro
  },
};
