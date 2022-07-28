import { io } from 'socket.io-client';
import {responderLabel, requesterLabel} from './store';

let res, req;
responderLabel.subscribe(x => res = x);
requesterLabel.subscribe(x => req = x);


export const SOAP_BOX_URL = "https://soapbox.wbx.ninja";
export const MAIN_ROOM = `call_queue_room`;
export const NODE_SERVER_URL = "https://mindy.wbx.ninja/virtual-nurse-request"
export const HCA_MAIN_SOCKET = io(SOAP_BOX_URL, { query: `room=${MAIN_ROOM}` });
