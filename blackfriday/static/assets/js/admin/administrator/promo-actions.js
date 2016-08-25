import Emitter from 'tiny-emitter';

export default class PromoActions extends Emitter {
	itemSelected(promoItemId) {
		this.emit('promos:itemSelected', {id: promoItemId});
	}

	onItemSelected(callback) {
		this.on('promos:itemSelected', callback);
	}

	itemUnselected(promoItemId) {
		this.emit('promos:itemUnselected', {id: promoItemId});
	}

	onItemUnselected(callback) {
		this.on('promos:itemUnselected', callback);
	}

	allSelected(stop) {
		this.emit('promos:allSelected', {stop: (stop || false)});
	}

	onAllSelected(callback) {
		this.on('promos:allSelected', callback);
	}

	allUnselected(stop) {
		this.emit('promos:allUnselected', {stop: (stop || false)});
	}

	onAllUnselected(callback) {
		this.on('promos:allUnselected', callback);
	}

	optionIncluded(option) {
		this.emit('promos:optionIncluded', {option: option});
		console.log('promos:optionIncluded', {option: option});
	}

	onOptionIncluded(callback) {
		this.on('promos:optionIncluded', callback);
	}

	optionExcluded(option) {
		this.emit('promos:optionExcluded', {option: option});
		console.log('promos:optionExcluded', {option: option});
	}

	onOptionExcluded(callback) {
		this.on('promos:optionExcluded', callback);
	}

	optionChanged(option) {
		this.emit('promos:optionChanged', {option: option});
		console.log('promos:optionChanged', {option: option});
	}

	onOptionChanged(callback) {
		this.on('promos:optionChanged', callback);
	}
}
