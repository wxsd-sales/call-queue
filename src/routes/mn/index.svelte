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
	let selectedGradNurse = {};
	let meetingURL;

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
		HCA_MAIN_SOCKET.emit('message', {
			command: 'remove',
			set: 'queue',
			data: selectedGradNurse.ID
		});
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
			// meetingURL = `${redirect}&embedSize=small&sessionID=${selectedGradNurse.ID}`;
			meetingURL =
				'https://tahanson.eu.ngrok.io/guest?destination=rtaylorhanson.wxsd@webex.com&embedSize=small&headerToggle=false&autoDial=false&sessionId=ajsdjhjasd&token=NjIxZTJhM2EtMjJlOS00NDJkLWJjMTItMmViOGViMDYyZDFiYmVhYmM3Y2QtZGU5_PF84_1eb65fdf-9643-417f-9974-ad72cae0e10f';
			joinSession = true;
			joinButtonIsLoading = false;
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
			<div class="columns is-mobile ">
				{#if !displayQueue}
					<div class="column is-2">
						<button
							class="button has-background-white is-active mb-1"
							on:click={() => {
								displayQueue = true;
							}}
						>
							<span class="icon has-text-info  ">
								<i class="mdi mdi-24px mdi-arrow-left " />
							</span>
						</button>
					</div>
				{/if}
				<div class="column is-10 title has-text-white has-text-centered is-4">
					Nurse Support Queue
				</div>
			</div>
		</div>
	</div>
	<div class="hero-body p-4 has-background-white">
		<div class="container has-text-centered">
			{#if joinSession}
				<iframe src={meetingURL} allow="camera;microphone" style="width: 100%; height:40rem;" />
			{:else if displayQueue}
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

<style>
	.queue {
		overflow: scroll;
		height: 40rem;
	}
</style>
