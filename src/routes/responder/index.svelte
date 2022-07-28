<script lang="ts">
	import QueueItem from './queueItem.svelte';
	import moment from 'moment';
	import { SOAP_BOX_URL, MAIN_ROOM, HCA_MAIN_SOCKET } from '$lib/constants';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { NODE_SERVER_URL } from '$lib/constants';
	import { virtualNurseID, headerTitle, requesterLabel, responderLabel } from '$lib/store';
	import { v4 as uuidv4 } from 'uuid';

	$virtualNurseID = $virtualNurseID ? $virtualNurseID : uuidv4();
	let queue = [];
	let displayQueue = true;
	let joinSession = false;
	let joinButtonIsLoading = false;
	let iframeIsLoading = false;
	let selectedGradNurse = {};
	let meetingURL = '';
	let showModal = false;

	HCA_MAIN_SOCKET.on('message', (message) => {
		if (message.room === $virtualNurseID) {
			if (message.data.event === 'members-update') {
				if (
					message.data.payload.updated.some(
						(participant: any) => participant.isSelf && !participant.isInMeeting
					)
				) {
					displayQueue = true;
					joinSession = false;
					joinButtonIsLoading = false;
					iframeIsLoading = false;
					removeQueue(selectedGradNurse);
				}
			}
		}

		if (message.command === 'append' && !queue.some((q) => q.ID === message.key)) {
			queue = [
				...queue,
				{
					timeStamp: moment().local(),
					ID: message.key,
					status: message.data.status
				}
			];
		}

		if (message.command === 'remove') {
			// this needs to change to message.key
			queue = queue.filter((q) => q.ID !== message.data);

			if (!queue.some((q) => q.ID === selectedGradNurse.ID)) {
				displayQueue = true;
			}
		}

		if (message.command === 'hset') {
			queue = queue.map((item) => {
				if (item.ID === message.key) {
					item.status = message.data.status;
				}

				return item;
			});
		}
	});

	const startSession = async () => {
		joinButtonIsLoading = true;
		try {
			const {
				data: { redirect }
			} = await axios({
				method: 'post',
				url: NODE_SERVER_URL,
				data: {
					guid: selectedGradNurse.ID,
					labels: {
						requester: $requesterLabel,
						responder: $responderLabel
					}
				}
			});

			meetingURL = `${redirect}&autoDial=true&embedSize=desktop&sessionId=${$virtualNurseID}`;
			joinSession = true;
			joinButtonIsLoading = false;
			iframeIsLoading = true;

			joinButtonIsLoading = false;
		} catch (error) {
			console.log(error);
		}
	};

	const removeQueue = (selectedNurse) => {
		HCA_MAIN_SOCKET.emit('message', {
			command: 'remove',
			set: 'queue',
			data: selectedNurse.ID,
			id: 'remove'
		});

		queue = queue.filter((q) => q.ID !== selectedNurse.ID);
	};

	onMount(() => {
		showModal = false;
		$headerTitle = 'Support Queue';
		HCA_MAIN_SOCKET.on('message-response', (message) => {
			if (message.id === 'initial-queue-request') {
				queue = message.data ? message.data : [];
				queue = queue.map((q) => {
					const newQ = {
						timeStamp: moment(q.score).local(),
						ID: q.value,
						status: JSON.parse(q.data).status
					};

					return newQ;
				});

				const userExists = queue.some((q) => q.ID === $virtualNurseID);
				$virtualNurseID = userExists ? $virtualNurseID : uuidv4();
				HCA_MAIN_SOCKET.emit('join', $virtualNurseID);
			}
		});

		HCA_MAIN_SOCKET.on('connect', () => {
			const message = { command: 'list', set: 'queue', id: 'initial-queue-request' };
			HCA_MAIN_SOCKET.emit('message', message);
			HCA_MAIN_SOCKET.emit('message', {
				command: 'set',
				set: 'labels',
				data: { responder: $responderLabel, requester: $requesterLabel }
			});
		});
	});

	const handleClick = (selectedNurse) => {
		if (selectedNurse.command) {
			if (selectedNurse.command === 'close') {
				showModal = true;
			} else if (selectedNurse.command === 'force-close') {
				removeQueue(selectedNurse);
			}
		} else {
			displayQueue = false;
		}

		selectedGradNurse = selectedNurse;
	};
</script>

<div class="hero-body p-4 ">
	<div
		class="container has-text-centered is-flex 	is-align-items-center is-justify-content-center is-flex-direction-column queue"
	>
		<span
			class="bulma-loader-mixin has-text-primary"
			class:is-hidden={!iframeIsLoading}
			style="position:absolute"
		/>
		<iframe
			title="meeting"
			class:is-hidden={!joinSession}
			src={meetingURL}
			allow="camera;microphone"
			on:load={() => {
				iframeIsLoading = false;
			}}
		/>
		{#if !joinSession}
			{#if displayQueue}
				{#if queue.length === 0}
					<div class="box is-translucent-black">
						<div class="subtitle has-text-white has-text-centered">There Are No Requests!</div>
					</div>
				{:else}
					<div class="is-flex is-flex-direction-column" style="height: 100%;">
						{#each queue as q}
							<QueueItem onClick={handleClick} data={q} />
						{/each}
					</div>
				{/if}
			{:else}
				<div class="box is-translucent-black p-0">
					<div class="is-flex is-justify-content-end m-2">
						<span
							class="icon has-text-danger "
							on:click={() => {
								displayQueue = true;
							}}
						>
							<i class="mdi mdi-24px mdi-close" />
						</span>
					</div>
					<div style="padding: 0 1.5rem 1.5rem 1.5rem">
						<div class="subtitle has-text-white has-text-centered is-size-4">
							Start Support Session
						</div>
						<button
							class="button is-size-5 mt-5 is-primary is-centered"
							class:is-loading={joinButtonIsLoading}
							on:click={startSession}
							>Join Session
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<div class="modal " class:is-active={showModal}>
	<div class="modal-background" on:click={() => (showModal = false)} />
	<div class="modal-content is-translucent-black" style="padding: 1.5rem 0.5rem; width: 22rem;">
		<div class="has-text-white has-text-centered">
			<div class="subtitle is-size-5 has-text-white mb-2 ">
				You are about to cancel this request.
			</div>
			<div class="subtitle is-size-5 has-text-white">The requester will be notified.</div>
			<div class="is-size-6">Would you like to continue?</div>
		</div>
		<div class="is-flex is-justify-content-center mt-4">
			<button
				class="button is-primary mr-6"
				on:click={() => {
					removeQueue(selectedGradNurse);
					showModal = false;
				}}>Yes</button
			>
			<button
				class="button is-danger"
				on:click={() => {
					showModal = false;
				}}>No</button
			>
		</div>
	</div>
</div>

<style>
	.queue {
		overflow: scroll;
		height: 40rem;
	}
</style>
