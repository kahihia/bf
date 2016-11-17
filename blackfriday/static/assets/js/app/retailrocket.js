/* eslint-disable */

initialize();

// 1. Основной трекинг-код системы
function initialize() {
	var rrPartnerId = "5824a80365bf194ae4415d12";
	var rrApi = {};
	var rrApiOnReady = rrApiOnReady || [];
	rrApi.addToBasket = rrApi.order = rrApi.categoryView = rrApi.view =
	rrApi.recomMouseDown = rrApi.recomAddToCart = function() {};
	(function(d) {
		var ref = d.getElementsByTagName('script')[0];
		var apiJs, apiJsId = 'rrApi-jssdk';
		if (d.getElementById(apiJsId)) return;
		apiJs = d.createElement('script');
		apiJs.id = apiJsId;
		apiJs.async = true;
		apiJs.src = "//cdn.retailrocket.ru/content/javascript/tracking.js";
		ref.parentNode.insertBefore(apiJs, ref);
	}(document));

	window.rrPartnerId = rrPartnerId;
	window.rrApi = rrApi;
	window.rrApiOnReady = rrApiOnReady;
}

// 2. Трекер просмотра карточки товара
export function action2({
	id = null,
	name = null,
	price = null,
	oldPrice = null,
	imageUrl = null,
	url = null,
	categoryPaths = null,
	brand = null
}) {
    (window["rrApiOnReady"] = window["rrApiOnReady"] || []).push(function() {
        // Передача данных о просматриваемом товаре
        retailrocket.products.post({
            // Идентификатор товара, число
            "id": id,
            // Название товара, строка
            "name": name,
            // Цена товара, число
            "price": price,
            "oldPrice": oldPrice,
            // Ссылка на изображение товара, не больше 250 KB. Предпочтительный размер 200-300 px.
            "pictureUrl": imageUrl,
            // Ссылка на товар
            "url": url,
            // Статус наличия товара, true или false
            "isAvailable": true,
            // Массив путей до категории товара. Разделитель между уровнями категорий – косая черта
            "categoryPaths": categoryPaths,
            // Описание товара
            "description": "",
            // Производитель товара, необязательный параметр
            "vendor": brand
        });

        // Уникальный идентификатор товара, число
        rrApi.view(id);
    });
}

// 3. Трекер просмотра страницы товарной категории
export function action3(categoryName) {
	(window["rrApiOnReady"] = window["rrApiOnReady"] || []).push(function() {
		// Полный путь до текущей категории с косой чертой в качестве разделителя, строка.
		// Должен совпадать с путем, передаваемым в карточках товаров данной категории.
		rrApi.categoryView(categoryName);
	});
}

// 5. Трекер совершения транзакции
export function action5({
	id = null,
	price = null
}) {
	(window["rrApiOnReady"] = window["rrApiOnReady"] || []).push(function() {
		try {
			rrApi.order({
				transaction: null,
				items: [
					{ id: id, qnt: 1,  price: price }
				]
			});
		} catch(e) {}
	})
}
