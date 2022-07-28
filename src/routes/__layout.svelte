<script lang="ts">
	import '../app.scss';
	import image from '../demo.jpeg';
	import { headerTitle, responderLabel, requesterLabel } from '$lib/store';
	import { page } from '$app/stores';

	const backgroundImg = $page.url.searchParams.get('backgroundImage') || image;

	$responderLabel = $page.url.searchParams.get('responderLabel') || 'responder';
	$requesterLabel = $page.url.searchParams.get('requesterLabel') || 'requester';
</script>

<section
	class="hero is-mobile is-fullheight"
	style="background: #fff url('{backgroundImg}') center center/cover no-repeat; "
>
	<div class="hero-head ">
		<div class="has-background-black box is-radiusless ">
			<div class="title has-text-white is-4">{$headerTitle}</div>
		</div>
	</div>
	<main>
		<slot />
	</main>
	<div class="hero-foot has-background-black pt-4 pb-2">
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
				<span class="icon has-text-success mb-2 ">
					<i class="mdi mdi-36px mdi-bell " />
				</span>
				<div class="has-text-success">Alerts</div>
			</div>
		</nav>
	</div>
</section>
