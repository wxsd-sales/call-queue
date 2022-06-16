import { io } from 'socket.io-client';


export const SOAP_BOX_URL = "https://soapbox.wbx.ninja";
export const MAIN_ROOM = "hca_req_queue";
export const NODE_SERVER_URL = "https://wxsd-na-dev.glitch.me/virtual-nurse-request"
export const HCA_MAIN_SOCKET = io(SOAP_BOX_URL, { query: `room=${MAIN_ROOM}` });

