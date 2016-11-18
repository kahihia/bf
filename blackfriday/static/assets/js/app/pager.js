import xhr from 'xhr';
import arrayShuffle from 'array-shuffle';
import arrayChunk from 'array.chunk';

/**
 * Pager
 *
 * @param {Object} o
 * @param {Number} o.perPage
 * @param {Number} [o.pagesCount]
 * @param {Number} [o.loadPagesCount=1]
 * @param {Boolean} [o.isCycled=false]
 * @param {Boolean} [o.isFullfilled=false]
 * @param {Boolean} [o.isRandom=false]
 * @param {String} o.ajaxUrl
 * @param {Boolean} [o.ajaxUrlRoot=false]
 * @param {Array} [o.preloadedData=null]
 * @param {Function} o.onNext
 * @param {Function} [o.onAllLoaded]
 * @param {Function} [o.onLoadstart]
 * @param {Function} [o.onLoadend]
 * @param {Function} [o.onInited]
 */
export default function Pager(o) {
	this._perPage = o.perPage;
	this._pagesCount = o.pagesCount;
	this._loadPagesCount = o.loadPagesCount || 1;
	this._isCycled = o.isCycled || false;
	// When perPage > page content - fill empty items with random loaded items
	this._isFullfilled = (o.isFullfilled && this._pagesCount > 1) || false;
	this._isRandom = o.isRandom || false;
	this._ajaxUrl = o.ajaxUrl;
	this._ajaxUrlRoot = o.ajaxUrlRoot || false;
	this._preloadedData = o.preloadedData || null;

	if (this._preloadedData) {
		this._pagesCount = Math.ceil(this._preloadedData.length / this._perPage);
	}

	this._onNext = o.onNext;
	this._onAllLoaded = o.onAllLoaded || function () {};
	this._onLoadstart = o.onLoadstart || function () {};
	this._onLoadend = o.onLoadend || function () {};
	this._onInited = o.onInited || function () {};

	this._currentIndex = 0;
	this._store = {};
	// Queue for random
	this._queue = [];
	// Chunks for super random
	this._queueChunk = [];
	this._isChunked = this._isRandom && (this._pagesCount > 1) && (this._loadPagesCount > 1);
	this._isAllLoaded = false;
	this._isInited = false;

	this._init();
}

Pager.prototype = {
	_init: function () {
		this._generateQueue();
		if (this._preloadedData) {
			// Fill preloaded data
			let l = this._preloadedData;
			if (this._isRandom) {
				l = arrayShuffle(l);
			}
			l = arrayChunk(this._preloadedData, this._perPage);
			l.forEach((data, index) => {
				this._saveToStore(index + 1, data);
			});
		}
		this.next();
	},

	_generateQueue: function () {
		let queue = [];
		for (let i = 1; i <= this._pagesCount; i += 1) {
			queue.push(i);
		}
		if (this._isRandom) {
			queue = arrayShuffle(queue);

			if (this._isChunked) {
				this._queueChunk = arrayChunk(queue, this._loadPagesCount);
			}
		}
		this._queue = queue;
	},

	_sendRequest: function (index, cb) {
		const pageNumber = this._getPageNumberByIndex(index);
		xhr({
			url: `${this._ajaxUrlRoot ? '/' : ''}?${this._ajaxUrl}=${pageNumber}`,
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				// Filter html page
				if (Array.isArray(data)) {
					cb(data);
				}
			// } else {
			//	 console.log('Undefined page')
			}
		});
	},

	next: function () {
		this._onLoadstart();
		const next = this._currentIndex + 1;
		if (next > this._pagesCount) {
			if (this._isCycled) {
				this._getPage(1);
			} else {
				// console.log('All loaded')
				this._onAllLoaded();
				this._onLoadend();
			}
		} else {
			this._getPage(next);
		}
	},

	prev: function () {
		this._onLoadstart();
		const prev = this._currentIndex - 1;
		if (prev < 1) {
			if (this._isCycled) {
				this._getPage(this._pagesCount);
			} else {
				// console.log('All loaded')
				this._onAllLoaded();
				this._onLoadend();
			}
		} else {
			this._getPage(prev);
		}
	},

	gotoPage: function (pageIndex) {
		if (pageIndex > this._pagesCount || pageIndex < 1) {
			return;
		}
		this._getPage(pageIndex);
	},

	_getPageNumberByIndex: function (index) {
		return this._queue[index - 1];
	},

	_getPageByIndex: function (index) {
		return this._store[this._getPageNumberByIndex(index)];
	},

	_saveToStore: function (index, data) {
		if (this._isRandom) {
			data = arrayShuffle(data);
		}
		this._store[this._getPageNumberByIndex(index)] = data;
	},

	_getPage: function (index) {
		const existsPage = this._getPageByIndex(index);
		if (existsPage) {
			setTimeout(() => {
				this._currentIndex = index;
				this._handleNext();
			}, 500);
			return;
		}

		if (this._isChunked) {
			this._loadQueueChunked(index);
			return;
		}

		this._sendRequest(index, resp => {
			this._saveToStore(index, resp);
			this._currentIndex = index;
			this._handleNext();
		});
	},

	_loadQueueChunked: function (index) {
		const chunkIndex = Math.ceil(index / this._loadPagesCount);
		const chunk = this._queueChunk[chunkIndex - 1];
		let chunkLength = chunk.length;
		let store = [];
		chunk.forEach(pageIndex => {
			this._sendRequest(pageIndex, resp => {
				chunkLength -= 1;
				store = store.concat(resp);
				if (chunkLength === 0) {
					store = arrayShuffle(store);
					store = arrayChunk(store, this._perPage);
					let i = store.length;
					while (i--) {
						this._saveToStore(index + i, store[i]);
					}
					this._currentIndex = index;
					this._handleNext();
				}
			});
		});
	},

	_handleNext: function () {
		const currentIndex = this._currentIndex;

		if (!this._isInited) {
			this._isInited = true;
			this._onInited({pagesCount: this._pagesCount});
		}

		if (currentIndex === this._pagesCount) {
			// console.log('All loaded')
			this._onAllLoaded();
		}

		if (this._isFullfilled) {
			this._fillEmptyPages(currentIndex);
		}

		this._onNext(this._getPageByIndex(currentIndex), currentIndex);
		this._onLoadend();
	},

	_fillEmptyPages: function (index) {
		const page = this._getPageByIndex(index);
		const emptyLength = this._perPage - page.length;
		if (emptyLength) {
			const randomLoaded = index - 1;
			const randomLoadedPage = this._getPageByIndex(randomLoaded);
			if (randomLoadedPage) {
				for (let i = 0; i < emptyLength; i += 1) {
					page.push(randomLoadedPage[i]);
				}
			}
		}
	}
};
