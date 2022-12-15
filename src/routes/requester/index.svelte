<script lang="ts">
	import { SOAP_BOX_URL, MAIN_ROOM, HCA_MAIN_SOCKET } from '$lib/constants';
	import { v4 as uuidv4 } from 'uuid';
	import { gradNurseID, headerTitle, queueOrder, filter } from '$lib/store';
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import axios from 'axios';

	let assistanceHasBeenRequested = false;
	let assitanceIsReady = false;
	let iframeIsLoading = false;
	let meetingURL = '';
	let finalMeetingURL = '';
	let readyToJoin = false;
	let showModal = false;
	let meetingInSession = false;
	let isSip = false;
	let tempID;
	let orderMsg = `You are next!`;
	let meetingType = 'SDK';
	let selectedNurse = {};
	let isOnDevice = browser ? (window.navigator.userAgent.includes('RoomOS') ? true : false) : false;

	const sendStatus = (status) => {
		HCA_MAIN_SOCKET.emit('message', {
			data: { ...selectedNurse, status },
			key: $gradNurseID,
			set: 'queue',
			command: 'hset'
		});
	};

	if (browser) {
		window.addEventListener('visibilitychange', function () {
			let status = 'active';

			if (document.visibilityState === 'hidden') {
				status = 'inactive';
			}

			sendStatus(status);
		});
	}

	const cancelRequest = () => {
		console.log('removing', $gradNurseID);
		HCA_MAIN_SOCKET.emit('message', {
			command: 'remove',
			set: 'queue',
			data: $gradNurseID,
			id: 'remove'
		});

		assistanceHasBeenRequested = false;
	};

	HCA_MAIN_SOCKET.on('message-response', (message) => {
		if (message.index || message.index === 0) {
			$queueOrder = message.index;
		}
	});

	HCA_MAIN_SOCKET.on('message', async (message) => {
		if (message.command === 'remove') {
			if (message.data === $gradNurseID) {
				assistanceHasBeenRequested = false;
				readyToJoin = false;
				assitanceIsReady = false;
			} else {
				if (tempID != message.data) {
					if (message.index < $queueOrder) {
						$queueOrder -= 1;
					}
					tempID = message.data;
				}
			}
		}
		if (message.room === $gradNurseID) {
			if (message.data.event === 'meeting-link') {
				assitanceIsReady = true;
				meetingURL = `${message.data.payload}&autoDial=true&embedSize=desktop&sessionId=${$gradNurseID}`;
			}
			if (message.data.event === 'members-update') {
				if (
					message.data.payload.updated.some(
						(participant: any) => participant.isSelf && !participant.isInMeeting
					) ||
					message.data.payload.updated.some(
						(participant: any) => participant.isHost && participant.status === 'NOT_IN_MEETING'
					)
				) {
					meetingURL = '';
					readyToJoin = false;
					assitanceIsReady = false;
					iframeIsLoading = false;
					cancelRequest();
				}
			}
			if (message.data.event === 'meeting-state-change') {
				console.log('MEETING STATE CHANGE', message.data.payload);
			}
		}
		if (message.set === 'IC_GUEST_URL' && $gradNurseID === message.data.gradNurseID) {
			const {
				data: { link, guestToken }
			} = message;
			assitanceIsReady = true;
			meetingURL = link;
		}

		if (message.set === 'REMOVE_IC_GUEST_URL' && $gradNurseID === message.data.gradNurseID) {
			readyToJoin = false;
			assitanceIsReady = false;
			iframeIsLoading = false;
			cancelRequest();
		}

		if (message.set === 'SIP_ADDRESS' && $gradNurseID === message.data.gradNurseID) {
			const {
				data: { link, guestToken }
			} = message;
			assitanceIsReady = true;
			meetingURL = link;
			isSip = true;
		}

		if (message.set === 'REMOVE_SIP_ADDRESS' && $gradNurseID === message.data.gradNurseID) {
			readyToJoin = false;
			assitanceIsReady = false;
			iframeIsLoading = false;
			meetingInSession = false;
			cancelRequest();
		}
	});

	const requestAssistance = () => {
		if ($gradNurseID === undefined) {
			$gradNurseID = uuidv4();
			HCA_MAIN_SOCKET.emit('join', $gradNurseID);
			console.log('joining now', $gradNurseID);
		}

		selectedNurse = { status: 'active', meetingType, sessionStatus: 'inactive' };
		const message = {
			room: MAIN_ROOM,
			command: 'append',
			set: 'queue',
			key: $gradNurseID,
			id: 'append',
			data: selectedNurse
		};

		HCA_MAIN_SOCKET.emit('message', message);
		assistanceHasBeenRequested = true;
	};

	const joinSession = () => {
		readyToJoin = true;
		finalMeetingURL = meetingURL;
		if (isSip) {
			meetingInSession = true;
		}
	};

	onMount(async () => {
		showModal = false;
		HCA_MAIN_SOCKET.on('message-response', (message) => {
			if (message.id === 'initial-queue-request') {
				message.data = message.data ? message.data : [];
				const userExists = message.data.some((q) => q.value === $gradNurseID);

				if (userExists) {
					assistanceHasBeenRequested = true;
				} else {
					$gradNurseID = uuidv4();
				}

				HCA_MAIN_SOCKET.emit('join', $gradNurseID);
				console.log('join initially', $gradNurseID);
			}
		});

		HCA_MAIN_SOCKET.on('connect', () => {
			const message = { command: 'list', set: 'queue', id: 'initial-queue-request' };
			HCA_MAIN_SOCKET.emit('message', message);
		});
	});
</script>

<div class="hero-body p-4">
	<div
		class="container is-flex is-justify-content-center	is-align-items-center is-flex-direction-column"
		style="height: 37.5rem;"
	>
		<span class="bulma-loader-mixin" class:is-hidden={!iframeIsLoading} style="position:absolute" />
		<iframe
			title="meeting"
			src={finalMeetingURL}
			class:is-hidden={!readyToJoin && !meetingInSession}
			allow="camera;microphone"
			on:load={() => {
				iframeIsLoading = false;
			}}
		/>
		{#if meetingInSession}
			<div
				class="flash box is-flex is-flex-direction-column is-translucent-black pb-5"
				style="padding: 2rem;"
			>
				<div class=" title has-text-white is-size-5 mb-4">Meeting In Session!</div>
			</div>
		{/if}
		{#if !readyToJoin}
			<div
				class="box is-flex is-flex-direction-column is-translucent-black pb-5"
				style="padding: 2rem;"
			>
				{#if assitanceIsReady}
					<div class="title has-text-white is-size-5 mb-4">Representative is now available!</div>
					<button class="button is-size-5 mt-6 is-primary is-centered" on:click={joinSession}
						>Join Support Session
					</button>
				{:else if assistanceHasBeenRequested}
					<div class="is-size-5 has-text-white has-text-centered">
						Your request has been queued. A representative will reach out shortly.
					</div>
					<span
						class="has-text-white has-text-centered flash"
						style="margin-top: 1.5rem; font-size: 0.9rem;"
					>
						{$queueOrder === 0
							? 'You are next!'
							: `There are ${$queueOrder} addtional requests ahead of you.`}
					</span>
					<button class="button is-size-5 mt-6 is-danger is-centered" on:click={cancelRequest}
						>Cancel Request
					</button>
				{:else}
					<div class="title has-text-white  has-text-centered is-size-4">
						Looking for Assistance?
					</div>
					<button
						class="button is-size-5 is-primary is-centered mb-3 mt-6"
						style="margin-top: 2rem;"
						on:click={requestAssistance}
						>Request Assistance
					</button>
					<div
						class="control is-justify-content-space-around is-flex has-text-white is-size-6"
						style="margin: 1rem 0 0.25rem 0;"
					>
						{#if !$filter.includes('SDK')}
							<label class="radio">
								<input
									type="radio"
									name="meeting"
									value="SDK"
									checked={meetingType === 'SDK'}
									on:change={(e) => (meetingType = e.currentTarget.value)}
								/>
								Meeting SDK
							</label>
						{/if}
						{#if !$filter.includes('IC')}
							<label class="radio">
								<input
									type="radio"
									name="meeting"
									checked={meetingType === 'IC'}
									value="IC"
									on:change={(e) => (meetingType = e.currentTarget.value)}
								/>
								Instant Connect
							</label>
						{/if}
						{#if !$filter.includes('SIP') && isOnDevice}
							<label class="radio">
								<input
									type="radio"
									name="meeting"
									checked={meetingType === 'SIP'}
									value="SIP"
									on:change={(e) => (meetingType = e.currentTarget.value)}
								/>
								SIP URI Dialing
							</label>
						{/if}
					</div>
					<div class="has-text-white has-text-centered mt-5" style="font-size: 0.65rem ">
						* Unanswered request will auto-expire in 30 minutes
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<div class="modal " class:is-active={showModal}>
	<div class="modal-background" on:click={() => (showModal = false)} />
	<div class="modal-content is-translucent-black" style="padding: 1.5rem 0.5rem; width: 22rem;">
		<div class="has-text-white has-text-centered">
			<div class="subtitle is-size-5 has-text-white mb-2 ">Your request has been canceled</div>
			<div class="subtitle is-size-5 has-text-white">Please try again.</div>
		</div>
		<div class="is-flex is-justify-content-center mt-4">
			<button
				class="button is-success"
				on:click={() => {
					showModal = false;
				}}>Acknowledge</button
			>
		</div>
	</div>
</div>
