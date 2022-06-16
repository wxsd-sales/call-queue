<script lang="ts">
	export let onClick = (ID: string) => {};
	export let data;

	const handleClick = () => {
		onClick(data);
	};
</script>

<div class="box is-clickable " on:click={handleClick}>
	<div class="columns is-mobile">
		<div class="column is-9">
			<div class="subtitle has-text-black">Nurse Support Request</div>
		</div>
		<div class="column is-3 is-size-6 p-0 pt-4">{data.timeStamp}</div>
	</div>
	<div class="columns">
		<div class="column has-text-dark">You have a new support meeting request</div>
		<div class="column has-text-dark" style="font-size: 0.75rem">ID: {data.ID}</div>
	</div>
</div>
