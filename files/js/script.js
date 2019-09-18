
const init = () => {

	const input = document.getElementById('input');
	input.addEventListener('change', onChange);

	const sampleData = input.getAttribute('data-sample');
	loadImage(sampleData).then(start);

}

const onChange = event => {

	const file = event.target.files[0];
	loadBase64(file).then(loadImage).then(start);

}

const start = image => {

	const size = {
		w: image.naturalWidth,
		h: image.naturalHeight
	};

	if (size.w + size.h > 2000) {
		alert('it`s over size.');
		return;
	}

	const imageData = getImagePixelData(image, size);
	const shadowValue = getImageDataToBoxShadow(imageData, size);
	const styleSheet = getStyleSheet(shadowValue, size);

	document.getElementById('image').src = image.src;
	document.getElementById('stylesheet').value = styleSheet;

	const styleSheetTag = document.createElement('style');
	styleSheetTag.insertAdjacentHTML('beforeend', styleSheet);
	document.body.insertAdjacentElement('beforeend', styleSheetTag);

}

const loadBase64 = file => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
		reader.readAsDataURL(file);
	});
}

const loadImage = src => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = error => reject(error);
		image.src = src;
	});
}

const getImagePixelData = (image, size) => {

	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = size.w;
	canvas.height = size.h;
	ctx.drawImage(image, 0, 0, size.w, size.h);
	return ctx.getImageData(0, 0, size.w, size.h).data;

}

const getImageDataToBoxShadow = (data, size) => {

	let valueList = [];
	let x = 1;
	let y = 1;

	for (let i = 0; i < data.length; i += 4) {

		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const a = data[i + 3] / 255;

		if (a != 0) {
			valueList.push( `${x}px ${y}px rgba(${[r, g, b, a].join(',')})`);
		}

		if (x >= size.w) {
			x = 1;
			y++;
		} else {
			x++;
		}

	}

	return valueList.join(',').replace(/\)\,/g,'),\n\t');

}

const getStyleSheet = (shadowValue, size) => {
return `.target {
	position: relative;
	width: ${size.w}px;
	height: ${size.h}px;
}

.target:after {
	content: '';
	position: absolute;
	top: -1px;
	left: -1px;
	width: 1px;
	height: 1px;
	box-shadow: ${shadowValue};
}`;
}

window.addEventListener('DOMContentLoaded', init, false);
