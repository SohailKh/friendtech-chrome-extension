export class StatsClient {
  async getStats(profile: string) {
    try {
      const response = await fetch(
        `https://localhost:3000/api/profile/${profile}`
      );
      const json = await response.json();
      return json;
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }
}
