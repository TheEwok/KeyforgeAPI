const request = require('request');
const jwt = require('jsonwebtoken');

const init_auth_url = "https://account.asmodee.net/main/v2/oauth/authorize?display=popup&scope=openid%20profile%20email&response_type=id_token%20token&client_id=keyforge-web-portal&state=%2f&redirect_uri=https%3A%2F%2Fwww.keyforgegame.com%2Fauthorize&nonce=";
const user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36";
const base_api_url = "https://m.keyforgegame.com/api";

// Wrap request with promise
function pRequest(request_options) {
  return new Promise((resolve, reject) => {
    request(request_options, (err, response, body) => {
      if(err) {
        return reject(err);
      }
      return resolve({response, body});
    }); 
  });
}

class API {

  constructor() {
    this.access_token = '';
    this.id_token = '';
    this.expires = '';
    this.x_auth_header = '';
    this.auth_header = '';
  }

  fetchTokens(login, password) {
    const instance = this;

    const request_options = {
      url: `${init_auth_url}${this.generateNonce(8)}`,
      method: "POST",
      form: { login, password },
      followRedirect: false,
      headers: {"User-Agent": user_agent}
    }
    
    return pRequest(request_options).then((body) => {
      this.parseLocationHeader(body); 
      return instance;
    })
    .catch((err) => {
      console.log(err); 
    });
  }
  
  parseLocationHeader(loc) {
    const token_split = loc.response.headers.location.split('#');
    const token_fields = token_split[1].split('&');
    
    this.access_token = token_fields[0].split('=')[1];
    this.id_token = token_fields[5].split('=')[1];
    this.expires = token_fields[1].split('=')[1];

    this.x_auth_header = `Token ${this.access_token}`;
    this.auth_header = `Token ${this.access_token}`;
  }

  generateNonce(nonce_length) {
    const nonce_bits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-._~";
    let text = '';

    for(let i = 0; i < nonce_length; i++) {
      text += nonce_bits.charAt(Math.floor(Math.random() * nonce_bits.length));
    }
    return text;
  }

  apiAuth() {
    const endpoint = '/users/login/asmodee/';
    const jwt_payload = jwt.decode(this.id_token);
    const nonce = jwt_payload.nonce;

    const request_options = {
      url: `${base_api_url}${endpoint}`,
      method: 'POST',
      form: {
        id_token: this.id_token,
        access_token: this.access_token,
        nonce: nonce
      },
      //headers: {
      //  "X-Authorization": this.x_auth_header,
      //  "Authorization": this.auth_header
      //}
    };
    
    console.log(request_options);    

    return pRequest(request_options).then((res) => {
      console.log(res.body);
    });
    
  }

  apiLogout() {
    const endpoint = '/users/logout/';
  }

  apiAddDeck() {
    const endpoint = '/decks/';
  }

  apiGetUserDecks() {
    const endpoint = `/decks/${userr}/decks`;
  }


}

module.exports = API;
