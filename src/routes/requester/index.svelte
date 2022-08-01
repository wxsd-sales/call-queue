<script lang="ts">
	import { SOAP_BOX_URL, MAIN_ROOM, HCA_MAIN_SOCKET } from '$lib/constants';
	import { v4 as uuidv4 } from 'uuid';
	import { gradNurseID, headerTitle, queueOrder } from '$lib/store';
	import { onMount } from 'svelte';
	import { browser } from '$app/env';

	let assistanceHasBeenRequested = false;
	let assitanceIsReady = false;
	let iframeIsLoading = false;
	let meetingURL = '';
	let finalMeetingURL = '';
	let readyToJoin = false;
	let showModal = false;
	let tempID;
	let orderMsg = `You are next!`;

	const sendStatus = (status) => {
		HCA_MAIN_SOCKET.emit('message', {
			data: { status },
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
		HCA_MAIN_SOCKET.emit('message', {
			command: 'remove',
			set: 'queue',
			data: $gradNurseID,
			id: 'remove'
		});

		assistanceHasBeenRequested = false;
	};

	const requestAssistance = () => {
		if (!$gradNurseID) {
			$gradNurseID = uuidv4();
		}

		const message = {
			room: MAIN_ROOM,
			command: 'append',
			set: 'queue',
			key: $gradNurseID,
			id: 'append',
			data: { status: 'active' }
		};

		HCA_MAIN_SOCKET.on('message-response', (message) => {
			if (message.index || message.index === 0) {
				$queueOrder = message.index;
			}
		});

		HCA_MAIN_SOCKET.on('message', (message) => {
			if (message.command === 'remove') {
				if (message.data === $gradNurseID) {
					assistanceHasBeenRequested = false;
					readyToJoin = false;
					assitanceIsReady = false;
					showModal = true;
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
						assistanceHasBeenRequested = false;
						iframeIsLoading = false;
						cancelRequest();
					}
				}
				if (message.data.event === 'meeting-state-change') {
					console.log('MEETING STATE CHANGE', message.data.payload);
				}
			}
		});

		HCA_MAIN_SOCKET.emit('message', message);
		assistanceHasBeenRequested = true;
	};

	const joinSession = () => {
		readyToJoin = true;
		finalMeetingURL = meetingURL;
	};

	onMount(() => {
		showModal = false;
		$headerTitle = 'Support Request';
		HCA_MAIN_SOCKET.on('message-response', (message) => {
			if (message.id === 'initial-queue-request') {
				message.data = message.data ? message.data : [];
				const userExists = message.data.some((q) => q.value === $gradNurseID);
				$gradNurseID = userExists ? $gradNurseID : uuidv4();
				HCA_MAIN_SOCKET.emit('join', $gradNurseID);
			}
			if (message.id === 'initial-label-request') {
				console.log(message.data);
			}
		});

		HCA_MAIN_SOCKET.on('connect', () => {
			const message = { command: 'list', set: 'queue', id: 'initial-queue-request' };
			HCA_MAIN_SOCKET.emit('message', message);
			HCA_MAIN_SOCKET.emit('message', {
				command: 'get',
				set: 'labels',
				id: 'initial-label-request'
			});
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
			class:is-hidden={!readyToJoin}
			allow="camera;microphone"
			on:load={() => {
				iframeIsLoading = false;
			}}
		/>
		{#if !readyToJoin}
			<div class="box is-flex is-flex-direction-column is-translucent-black pb-5">
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
					<div class="title has-text-white is-size-4">Looking for Assistance?</div>
					<button
						class="button is-size-5 is-primary is-centered mb-3"
						style="margin-top: 2rem;"
						on:click={requestAssistance}
						>Request Assistance
					</button>
					<div class="has-text-white mt-4" style="font-size: 0.65rem ">
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
