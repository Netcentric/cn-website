const iframe = '<iframe src="//www.careers-page.com/netcentric" class="embed-job-openings"></iframe>';

export default function decorate(block) {
  block.innerHTML = iframe;
}
