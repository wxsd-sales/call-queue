import { localStorage, sessionStorage, storage } from './storage';

export const gradNurseID = sessionStorage('GRAD_NURSE_ID', undefined);
export const virtualNurseID = sessionStorage('MENTORED_NURSE_ID', undefined);
export const headerTitle = sessionStorage('HEADER_TITLE', '');
export const queueOrder = sessionStorage('QUEUE_ORDER', 0);
export const requesterLabel = sessionStorage('REQUESTER_LABEL', 'requester');
export const responderLabel = sessionStorage('RESPONDER_LABEL', 'responder');
export const meetingType = sessionStorage('MEETING_TYPE', 'SDK');