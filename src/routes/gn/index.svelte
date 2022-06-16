<script lang="ts">
	import { SOAP_BOX_URL, MAIN_ROOM, HCA_MAIN_SOCKET } from '$lib/constants';
	import { v4 as uuidv4 } from 'uuid';
	import { io } from 'socket.io-client';
	import { gradNurseID } from '$lib/store';
	import { onMount } from 'svelte';

	let assistanceHasBeenRequested = false;
	let assitanceIsReady = false;
	let meetingURL = '';
	let readyToJoin = false;
	let socket;

	const cancelRequest = () => {
		HCA_MAIN_SOCKET.emit('message', {
			command: 'remove',
			set: 'queue',
			data: $gradNurseID
		});
		$gradNurseID = undefined;
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
			data: $gradNurseID
		};

		socket.on('message', (message) => {
			console.log('DATA', message);
			if (message.room === $gradNurseID) {
				if (message.data.event === 'meeting-link') {
					assitanceIsReady = true;
					meetingURL = `${message.data.payload}&embedsize=small&sessionId=${$gradNurseID}`;
				}
				if (message.data.event === 'members-update') {
					console.log('MEMBERS UPDATE', message.data.payload);
				}
			}
		});

		socket.emit('message', message);
		assistanceHasBeenRequested = true;
	};

	const joinSession = () => {
		readyToJoin = true;
	};

	onMount(() => {
		HCA_MAIN_SOCKET.on('message-response', (message) => {
			if (message.id === 'initial-queue-request') {
				message.data = message.data ? message.data : [];
				const userExists = message.data.some((q) => q.value === $gradNurseID);
				$gradNurseID = userExists ? $gradNurseID : uuidv4();
				socket = io(SOAP_BOX_URL, { query: `room=${$gradNurseID}` });
			}
		});

		HCA_MAIN_SOCKET.on('connect', () => {
			const message = { command: 'list', set: 'queue', id: 'initial-queue-request' };
			HCA_MAIN_SOCKET.emit('message', message);
		});
	});
</script>

<section class="hero is-fullheight">
	<div class="hero-head ">
		<div class="box  has-background-info  has-text-centered">
			<div class="title has-text-white is-4">Nurse Support Request</div>
		</div>
	</div>
	<div class="hero-body p-4 has-background-white">
		<div class="container has-text-centered">
			{#if readyToJoin}
				<iframe src={meetingURL} allow="camera;microphone" style="width: 100%; height:40rem;" />
			{:else if assitanceIsReady}
				<div class="is-size-4 mb-4">Virtual nurse is now available!</div>
				<button class="button is-size-5 mt-6 is-primary is-centered" on:click={joinSession}
					>Join Support Session
				</button>
			{:else if assistanceHasBeenRequested}
				<div class="is-size-5">
					Your request has been queued. A virtual nurse will reach out shortly.
				</div>
				<button class="button is-size-5 mt-6 is-danger is-centered" on:click={cancelRequest}
					>Cancel Request
				</button>
			{:else}
				<div class="title is-size-4">Looking for Assistance?</div>
				<button class="button is-size-5 mt-6 is-primary is-centered" on:click={requestAssistance}
					>Request Assistance
				</button>
			{/if}
		</div>
	</div>
	<div class="hero-foot mt-4 mb-2">
		<nav class="level is-mobile">
			<div class="level-item has-text-centered is-flex is-flex-direction-column">
				<button class="button has-background-grey-light mb-1">
					<span class="icon has-text-light ">
						<i class="mdi mdi-24px mdi-view-dashboard " />
					</span>
				</button>
				<div>Dashboard</div>
			</div>
			<div class="level-item has-text-centered is-flex is-flex-direction-column">
				<button class="button has-background-grey-light mb-1">
					<span class="icon has-text-light ">
						<i class="mdi mdi-24px mdi-account " />
					</span>
				</button>
				<div>Patients</div>
			</div>
			<div class="level-item has-text-centered is-flex is-flex-direction-column">
				<button class="button has-background-grey-light mb-1">
					<span class="icon has-text-light ">
						<i class="mdi mdi-24px mdi-contacts " />
					</span>
				</button>
				<div>Contacts</div>
			</div>
			<div class="level-item has-text-centered is-flex is-flex-direction-column">
				<button class="button has-background-white is-active mb-1">
					<span class="icon has-text-info  ">
						<i class="mdi mdi-24px mdi-contacts " />
					</span>
				</button>
				<div>Alerts</div>
			</div>
		</nav>
	</div>
</section>
