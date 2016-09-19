import Emitter from 'tiny-emitter';

export default class InvoiceActions extends Emitter {
	itemSelected(invoiceItemId) {
		this.emit('invoices:itemSelected', {id: invoiceItemId});
	}

	onItemSelected(callback) {
		this.on('invoices:itemSelected', callback);
	}

	itemUnselected(invoiceItemId) {
		this.emit('invoices:itemUnselected', {id: invoiceItemId});
	}

	onItemUnselected(callback) {
		this.on('invoices:itemUnselected', callback);
	}

	allSelected(stop) {
		this.emit('invoices:allSelected', {stop: (stop || false)});
	}

	onAllSelected(callback) {
		this.on('invoices:allSelected', callback);
	}

	allUnselected(stop) {
		this.emit('invoices:allUnselected', {stop: (stop || false)});
	}

	onAllUnselected(callback) {
		this.on('invoices:allUnselected', callback);
	}

	statusChanged(invoiceIds, newStatus) {
		this.emit('invoices:statusChanged', {invoiceIds: invoiceIds, newStatus: newStatus});
	}

	onStatusChanged(callback) {
		this.on('invoices:statusChanged', callback);
	}

	itemExpireDateChanged(invoiceId, newDate) {
		this.emit('invoices:itemExpireDateChanged', {invoiceId, newDate});
	}

	onItemExpireDateChanged(callback) {
		this.on('invoices:itemExpireDateChanged', callback);
	}
}
