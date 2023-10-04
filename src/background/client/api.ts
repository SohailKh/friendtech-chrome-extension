export class StatsClient {
  async getStats(profile: string) {
    try {
      const response = await fetch(
        `https://friendtech-ui.onrender.com/api/profile/${profile}`
      );
      if (!response.ok) {
        throw new Error("Network error");
      }
      const json = await response.json();
      return json;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async checkIfExists(profiles: [string]) {
    const queryParams = profiles
      .map((profile) => `profile=${profile}&`)
      .join("");
    try {
      const response = await fetch(
        `https://friendtech-ui.onrender.com/api/exists?${queryParams}`
      );
      if (!response.ok) {
        throw new Error("Network error");
      }
      const json = await response.json();
      return json;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
