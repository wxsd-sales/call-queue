<script lang="ts">
	import { SOAP_BOX_URL, MAIN_ROOM, HCA_MAIN_SOCKET } from '$lib/constants';
	import { v4 as uuidv4 } from 'uuid';
	import { gradNurseID } from '$lib/store';
	import { onMount } from 'svelte';

	let assistanceHasBeenRequested = false;
	let assitanceIsReady = false;
	let iframeIsLoading = false;
	let meetingURL = '';
	let readyToJoin = false;

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

		HCA_MAIN_SOCKET.on('message', (message) => {
			if (message.room === $gradNurseID) {
				if (message.data.event === 'meeting-link') {
					assitanceIsReady = true;
					meetingURL = `${message.data.payload}&autoDial=true&embedSize=desktop&sessionId=${$gradNurseID}`;
				}
				if (message.data.event === 'members-update') {
					if (
						message.data.payload.updated.some(
							(participant: any) => participant.isSelf && !participant.isInMeeting
						)
					) {
						readyToJoin = false;
						assitanceIsReady = false;
						assistanceHasBeenRequested = false;
						iframeIsLoading = false;
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
	};

	onMount(() => {
		HCA_MAIN_SOCKET.on('message-response', (message) => {
			if (message.id === 'initial-queue-request') {
				message.data = message.data ? message.data : [];
				const userExists = message.data.some((q) => q.value === $gradNurseID);
				$gradNurseID = userExists ? $gradNurseID : uuidv4();
				HCA_MAIN_SOCKET.emit('join', $gradNurseID);
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
		<div
			class="container is-flex is-justify-content-center	is-align-items-center is-flex-direction-column"
		>
			<span
				class="bulma-loader-mixin"
				class:is-hidden={!iframeIsLoading}
				style="position:absolute"
			/>
			<iframe
				title="meeting"
				src={meetingURL}
				class:is-hidden={!readyToJoin}
				allow="camera;microphone"
				style="width: 100%; height:40rem;"
				on:load={() => {
					iframeIsLoading = false;
				}}
			/>
			{#if !readyToJoin}
				{#if assitanceIsReady}
					<div class="title is-size-4 mb-4">Virtual nurse is now available!</div>
					<button class="button is-size-5 mt-6 is-primary is-centered" on:click={joinSession}
						>Join Support Session
					</button>
				{:else if assistanceHasBeenRequested}
					<div class="is-size-5 has-text-centered">
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
			{/if}
		</div>
	</div>
	<div class="hero-foot mt-4 mb-2">
		<nav class="level is-mobile">
			<div class="level-item has-text-centered is-flex is-flex-direction-column">
				<span class="icon has-text-grey mb-2 ">
					<i class="mdi mdi-36px mdi-view-dashboard " />
				</span>
				<div>Dashboard</div>
			</div>
			<div class="level-item has-text-centered is-flex is-flex-direction-column">
				<span class="icon has-text-grey mb-2">
					<i class="mdi mdi-36px mdi-account " />
				</span>
				<div>Patients</div>
			</div>
			<div class="level-item has-text-centered is-flex is-flex-direction-column">
				<span class="icon has-text-grey mb-2 ">
					<i class="mdi mdi-36px mdi-contacts " />
				</span>
				<div>Contacts</div>
			</div>
			<div class="level-item has-text-centered is-flex is-flex-direction-column">
				<span class="icon has-text-info mb-2 ">
					<i class="mdi mdi-36px mdi-bell " />
				</span>
				<div class="has-text-info">Alerts</div>
			</div>
		</nav>
	</div>
</section>
