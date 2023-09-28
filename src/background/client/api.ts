export class StatsClient {
  async getStats(profile: string) {
    fetch(`https://localhost:3000/api/profile/${profile}`)
        .then((response) => response.json())
        .then((data) => {
          return data
        })
        .catch((error) => {
          return error;
        });
      return new Promise((resolve, reject) => {}); // This keeps the message channel open until `sendResponse` is called or the promise is settled.
    }
}
