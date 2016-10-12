import urllib.parse
from xml.etree.ElementTree import Element, SubElement, ElementTree
from django.conf import settings


class FeedGenerator:

    def __init__(self, controls=None):
        if controls is None:
            controls = {}
        self.controls = controls
        self.excludes = controls.get('excludes', {})
        self.url_bindings = controls.get('url_bindings', {})

    def get_product_url(self, product):
        return product.url

    def get_category_url(self, product):
        return '{}/category/{}'.format(
            settings.SITE_URL, product.category.slug
        )

    def get_merchant_url(self, product):
        return '{}/merchant/{}'.format(
            settings.SITE_URL, product.merchant.slug
        )

    def build_url(self, url):
        split_result = urllib.parse.urlsplit(url)
        qs_params = dict(urllib.parse.parse_qsl(split_result.query))
        qs_params.update({key: value for key, value in self.controls.get('utm', {}).items() if value is not None})
        result_query = urllib.parse.urlencode(qs_params)
        return urllib.parse.urlunsplit((
            split_result.scheme, split_result.netloc, split_result.path, result_query, split_result.fragment
        ))

    def get_url(self, url_tag, product):
        func = {
            'url': self.get_merchant_url,
            'url_cat': self.get_category_url,
            'url_shop': self.get_merchant_url
        }.get(self.url_bindings.get(url_tag, url_tag))
        if func is None:
            return ''
        return func(product)

    def generate(self, products, categories):
        catalog = Element('yml_catalog')
        shop = SubElement(catalog, 'shop')

        name = SubElement(shop, 'name')
        name.text = 'Настоящая черная пятница'

        company = SubElement(shop, 'company')
        company.text = 'Настоящая черная пятница'

        if 'cmonday_url' not in self.excludes:
            url = SubElement(shop, 'url')
            url.text = settings.SITE_URL

        currencies = SubElement(shop, 'currencies')
        SubElement(currencies, 'currency', {'id': 'RUR', 'rate': '1'})

        categories_element = SubElement(shop, 'categories')
        main_category = SubElement(categories_element, 'category', {'id': '1'})
        main_category.text = 'Все товары'
        teaser_category = SubElement(categories_element, 'category', {'id': '2'})
        teaser_category.text = 'Товары тизеры'
        for category in categories:
            category_element = SubElement(
                categories_element,
                'category',
                {
                    'id': str(
                        category.id if settings.DEFAULT_CATEGORY_SLUG == category.slug else
                        category.id + settings.RETAIL_ROCKET_CAT_SHIFT),
                    'parentId': '1'
                }
            )
            category_element.text = category.name

        offers = SubElement(shop, 'offers')
        for product in products:
            offer = SubElement(offers, 'offer', {'id': str(product.id), 'available': 'true'})

            if 'url' not in self.excludes:
                url = SubElement(offer, 'url')
                url.text = self.build_url(self.get_url('url', product))

            if 'url_cat' not in self.excludes:
                url_cat = SubElement(offer, 'url_cat')
                url_cat.text = self.build_url(self.get_url('url_cat', product))

            if 'url_shop' not in self.excludes:
                url_shop = SubElement(offer, 'url_shop')
                url_shop.text = self.build_url(self.get_url('url_shop', product))

            if 'logo' not in self.excludes and product.image:
                param_logo = SubElement(offer, 'param', {'name': 'logo'})
                param_logo.text = product.image

            if 'price2' not in self.excludes and product.start_price:
                price2 = SubElement(offer, 'param', {'name': 'price2'})
                price2.text = 'ОТ {}'.format(product.start_price)

            if 'bannerskidka' not in self.excludes and product.discount:
                bannerskidka = SubElement(offer, 'param', {'name': 'bannerskidka'})
                bannerskidka.text = str(product.discount)

            if 'legal_info' not in self.excludes and (
                    product.merchant.advertiser.profile and product.merchant.advertiser.profile.legal_address):
                legal_info = SubElement(offer, 'legal_info')
                legal_info.text = product.merchant.advertiser.profile.legal_address

            if self.controls.get('show_teaser_cat', False) and product.is_teaser_on_main:
                additional_category = SubElement(offer, 'categoryId')
                additional_category.text = '2'

            category = SubElement(offer, 'categoryId')
            category.text = str(
                product.category.id if settings.DEFAULT_CATEGORY_SLUG == product.category.slug else
                product.category.id + settings.RETAIL_ROCKET_CAT_SHIFT)

            price = SubElement(offer, 'price')
            price.text = str(product.price or '')

            old_price = SubElement(offer, 'oldprice')
            old_price.text = str(product.old_price or '')

            currency = SubElement(offer, 'currencyId')
            currency.text = 'RUR'

            picture = SubElement(offer, 'picture')
            picture.text = product.image

            name = SubElement(offer, 'name')
            name.text = product.name

            vendor = SubElement(offer, 'vendor')
            vendor.text = product.brand

            country_of_origin = SubElement(offer, 'country_of_origin')
            country_of_origin.text = product.country
        return ElementTree(catalog)
