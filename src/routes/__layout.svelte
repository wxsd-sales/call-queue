<script lang="ts">
	import '../app.scss';
	import image from '../demo.jpeg';
	import { headerTitle, responderLabel, requesterLabel, filter } from '$lib/store';
	import { page } from '$app/stores';

	const backgroundImg = $page.url.searchParams.get('backgroundImage') || image;

	$responderLabel = 'responder';
	$requesterLabel = 'requester';
	$headerTitle = $page.url.searchParams.get('title') || '';
	$filter =
		$page.url.searchParams
			.get('filter')
			?.split(',')
			.map((type) => type.trim().toLocaleUpperCase()) || [];
</script>

<section
	class="hero is-mobile is-fullheight"
	style="background: #fff url('{backgroundImg}') center center/cover no-repeat; "
>
	<div class="hero-head ">
		{#if $headerTitle !== ''}
			<div class="has-background-black box is-radiusless ">
				<div class="title has-text-white is-4">{$headerTitle}</div>
			</div>
		{/if}
	</div>
	<main>
		<slot />
	</main>
	<div class="hero-foot pt-4 pb-2" />
</section>
