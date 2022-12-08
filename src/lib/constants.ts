import { io } from 'socket.io-client';
import {responderLabel, requesterLabel} from './store';

let res, req;
responderLabel.subscribe(x => res = x);
requesterLabel.subscribe(x => req = x);


export const SOAP_BOX_URL = "https://soapbox.wbx.ninja";
export const MAIN_ROOM = `call_queue_room`;
export const NODE_SERVER_URL_GUEST_DEMO = "https://mindy.wbx.ninja/virtual-nurse-request"
export const NODE_SERVER_URL_SIP_DEMO = "https://mindy.wbx.ninja/virtual-nurse-sip-address-request"
export const HCA_MAIN_SOCKET = io(SOAP_BOX_URL, { query: `room=${MAIN_ROOM}` });
export const DUMMY_USER_WEBEX_ID = 'Y2lzY29zcGFyazovL3VzL1BFT1BMRS84M2Q1MGZmYi00NjVmLTRiYjctOTQzNy1hNWViMDZlZjNhZGQ';
export const WEBEX_TOKEN_URL = 'https://webexapis.com/v1/access_token';
