<script lang="ts">
	import QueueItem from './queueItem.svelte';
	import moment from 'moment';
	import { SOAP_BOX_URL, MAIN_ROOM, HCA_MAIN_SOCKET } from '$lib/constants';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { NODE_SERVER_URL } from '$lib/constants';
	import { gradNurseID } from '$lib/store';
	import { v4 as uuidv4 } from 'uuid';

	$gradNurseID = $gradNurseID ? $gradNurseID : uuidv4();
	let queue = [];
	let displayQueue = true;
	let joinSession = false;
	let joinButtonIsLoading = false;
	let iframeIsLoading = false;
	let selectedGradNurse = {};
	let meetingURL = '';

	HCA_MAIN_SOCKET.on('message', (message) => {
		if (message.command === 'append' && !queue.some((q) => q.ID === message.data)) {
			queue = [
				{
					timeStamp: moment().local().format('LT'),
					ID: message.data
				},
				...queue
			];
		}

		if (message.command === 'remove') {
			queue = queue.filter((q) => q.ID !== message.data);

			if (!queue.some((q) => q.ID === selectedGradNurse.ID)) {
				displayQueue = true;
			}
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
					guid: selectedGradNurse.ID
				}
			});

			meetingURL = `${redirect}&embedSize=small&sessionID=${selectedGradNurse.ID}`;
			joinSession = true;
			joinButtonIsLoading = false;
			iframeIsLoading = true;

			HCA_MAIN_SOCKET.emit('message', {
				command: 'remove',
				set: 'queue',
				data: selectedGradNurse.ID
			});
		} catch (error) {
			console.log(error);
		}
	};

	onMount(() => {
		HCA_MAIN_SOCKET.on('message-response', (message) => {
			if (message.id === 'initial-queue-request') {
				queue = message.data ? message.data : [];
				queue = queue.map((q) => {
					const newQ = {
						timeStamp: moment(q.score).local().format('LT'),
						ID: q.value
					};

					return newQ;
				});
			}
		});

		HCA_MAIN_SOCKET.on('connect', () => {
			const message = { command: 'list', set: 'queue', id: 'initial-queue-request' };
			HCA_MAIN_SOCKET.emit('message', message);
		});
	});

	const handleClick = (selectedNurse) => {
		displayQueue = false;
		selectedGradNurse = selectedNurse;
	};
</script>

<section class="hero is-fullheight">
	<div class="hero-head ">
		<div class="box has-background-info  ">
			{#if !displayQueue && !joinSession}
				<span
					class="icon has-text-white "
					style="display: block; position:absolute;"
					on:click={() => {
						displayQueue = true;
					}}
				>
					<i class="mdi mdi-24px mdi-arrow-left " />
				</span>
			{/if}
			<div class="title has-text-white has-text-centered is-4">Nurse Support Queue</div>
		</div>
	</div>
	<div class="hero-body p-4 has-background-white">
		<div
			class="container has-text-centered is-flex is-justify-content-center	is-align-items-center is-flex-direction-column"
		>
			<span
				class="bulma-loader-mixin"
				class:is-hidden={!iframeIsLoading}
				style="position:absolute"
			/>
			<iframe
				title="meeting"
				class:is-hidden={!joinSession}
				src={meetingURL}
				allow="camera;microphone"
				style="width: 100%; height:40rem;"
				on:load={() => {
					iframeIsLoading = false;
				}}
			/>
			{#if !joinSession}
				{#if displayQueue}
					<div class="queue">
						{#each queue as q}
							<QueueItem onClick={handleClick} data={q} />
						{/each}
					</div>
				{:else}
					<QueueItem data={selectedGradNurse} />
					<button
						class="button is-size-5 mt-6 is-primary is-centered"
						class:is-loading={joinButtonIsLoading}
						on:click={startSession}
						>Start Support Session
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

<style>
	.queue {
		overflow: scroll;
		height: 40rem;
	}
</style>
