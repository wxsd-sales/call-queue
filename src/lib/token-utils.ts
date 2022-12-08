import moment from 'moment';
import axios from 'axios';
import { WEBEX_TOKEN_URL, DUMMY_USER_WEBEX_ID } from './constants';

export const validateToken = async (token) => {
  if (moment(token.expires_at).isBefore(moment().utc(), 'minute')) {
    const client_id = 'C9a60eaf791c24144eda8fce5121a24af84bb243712c3c7b41ca5c3f00ab45391';
    const client_secret = '71ec6e79c06d1feee2bec7028c7c3b9b716d91ea44e2b207fc91f5302a0d80b4';
    const grant_type = 'refresh_token';

    const { data: {access_token, refresh_token, expires_in} } = await axios.post(WEBEX_TOKEN_URL, {
      client_id, grant_type, client_secret, refresh_token: token.refresh_token
    });

    return {
      webex_id: DUMMY_USER_WEBEX_ID,
      access_token,
      refresh_token,
      expires_at: moment().utc().add(expires_in, 'seconds').toString()
    }
  } else {
    return token;
  }
}