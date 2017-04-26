from rest_framework_nested.routers import NestedSimpleRouter


class RouterDeleteMixin:
    """
    Adds DELETE call to viewset's root url
    """

    def get_routes(self, viewset):
        routes = super().get_routes(viewset)

        if hasattr(viewset, 'delete'):
            routes[0].mapping['delete'] = 'delete'
        return routes


class ExtendedNestedRouter(RouterDeleteMixin, NestedSimpleRouter):
    pass
