const Twit = require("twit");
const FS = require("fs");
const config = require("./config");

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
      return getAllPyragues();
    })
    .catch(error => console.error(`Error: ${error}`));
}

getAllPyragues().then(() => {
  console.log("Fin de colecta de pyragues");
  let idsMap = pyragues.map(p => p.id_str);
  FS.writeFile("pyragues.csv", idsMap.join("\r\n"), err => {
    if (err) {
      console.error(`Error al generar CSV: ${err}`);
      return;
    }
  });
  FS.writeFile("pyragues.json", JSON.stringify(pyragues), err => {
    if (err) {
      console.error(`Error al generar JSON: ${err}`);
    }
  });
  console.log(`Registros encontrados: ${pyragues.length}`);
});

function getPyragues(cursor) {
  return new Promise((resolve, reject) => {
    T.get(
      "followers/list",
      {
        screen_name: "horacio_cartes",
        skip_status: "true",
        count: 200,
        cursor: nextCursor
      },
      (err, data, response) => {
        if (err) {
          reject(err);
          return;
        }

        let pyragues = data.users.filter(u => {
          const fecha = new Date(u.created_at);
          return u.profile_image_url ==
            "http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" &&
            u.followers_count < 100 &&
            u.friends_count < 150 &&
            fecha > new Date(2017, 3, 1);
        });
        let nextCursor = data.next_cursor_str;
        resolve({ pyragues, nextCursor });
      }
    );
  });
}
