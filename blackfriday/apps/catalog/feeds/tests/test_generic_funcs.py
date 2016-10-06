from django.conf import settings

from apps.catalog.feeds.verifier import together, old_price_gte_price, duplicate_product_urls, clear_category


def test_together_given_both_not_null_members_expect_true():
    assert together(**{'foo': 'bar', 'bar': 'foo'})


def test_together_given_both_null_members_expect_true():
    assert together(**{'foo': None, 'bar': None})


def test_together_given_partially_null_members_expect_false():
    assert not together(**{'foo': None, 'bar': 'foo'})


def test_old_price_gte_price_expect_true():
    assert old_price_gte_price(23, 22)


def test_old_price_gte_price_expect_false():
    assert not old_price_gte_price(22, 23)


def test_old_price_gte_price_given_nullable_old_price_expect_false():
    assert not old_price_gte_price(None, 23)


def test_old_price_gte_price_given_nullable_price_expect_false():
    assert not old_price_gte_price(23, None)


def test_duplicate_product_urls_given_nullable_url_expect_none():
    assert duplicate_product_urls(None, {}) is None


def test_duplicate_product_urls_given_new_url_expect_true_and_urls_updated():
    context = {'product_urls': set()}
    assert duplicate_product_urls('foo', context)
    assert context['product_urls'] == {'foo'}


def test_duplicate_product_urls_given_old_url_expect_false():
    context = {'product_urls': {'foo'}}
    assert not duplicate_product_urls('foo', context)


def test_clear_category_given_nullable_category_expect_none():
    assert clear_category(None, {}) is None


def test_clear_category_given_unregognizable_category_expect_default_category():
    assert clear_category('foo', {'categories': []}) == settings.DEFAULT_CATEGORY_NAME


def test_clear_category_given_existing_category_expect_category():
    assert clear_category('foo', {'categories': ['foo']}) == 'foo'
