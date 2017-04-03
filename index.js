const Twit = require("twit");
const ToCSV = require("array-to-csv");
const FS = require("fs");
const config = require('./config');

var T = new Twit({
 consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token: config.access_token,
  access_token_secret: config.access_token_secret,
  timeout_ms: 60 * 1000 // optional HTTP request timeout to apply to all requests.
});

let pyragues = [];
let nextCursor = -1;

function getAllPyragues() {
  return getPyragues(nextCursor)
    .then(data => {
      nextCursor = data.nextCursor;
      pyragues = pyragues.concat(data.pyragues);
      console.log("Se obtuvieron nuevos pyragues");
      return getAllPyragues();
    })
    .catch(error => console.error(`Error: ${error}`));
}

getAllPyragues().then(() => {
  console.log(`Final pyragues: ${pyragues}`);
  FS.writeFile("pyragues.csv", ToCSV(pyragues.map(p => p.id)), err => {
    if (err) {
      console.error(`Error al generar CSV: ${err}`);
      return;
    }
  });
});

function getPyragues(cursor) {
  return new Promise((resolve, reject) => {
    T.get(
      "followers/list",
      {
        screen_name: "hoypy",
        skip_status: "true",
        count: 200,
        cursor: nextCursor
      },
      (err, data, response) => {
        if (err) {
          reject(err);
          return;
        }

        let pyragues = data.users.filter(
          u =>
            u.profile_image_url = "http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" &&
              u.followers_count < 100
        );
        let nextCursor = data.next_cursor;
        resolve({ pyragues, nextCursor });
      }
    );
  });
}
