const tagString = '<iframe src="//www.careers-page.com/netcentric" class="embed-job-openings"></iframe>';
const range = document.createRange();
const jobOpeningsBlock = document.querySelectorAll('div.job-openings');
const jobOpeningsBlockItem = jobOpeningsBlock.item(0);
const emptyDiv = jobOpeningsBlockItem.firstElementChild;

range.selectNode(jobOpeningsBlockItem);
const documentFragment = range.createContextualFragment(tagString);
jobOpeningsBlockItem.appendChild(documentFragment);

emptyDiv.remove();
