import json

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view
from libs.api.permissions import IsAdmin, IsAuthenticated, ReadOnly

from .serializers import Category, CategorySerializer
from ..verifier import FeedParser


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated & IsAdmin | ReadOnly]


@api_view(['POST'])
def product_feed_parse(request):
    f = request.FILES.get('file')
    if f is None:
        return Response({'message': 'file is required'}, 400)
    result = []
    for counter, row in enumerate(FeedParser(f)):
        cleaned_data, errors, warnings = row
        result.append({
            '_id': counter,
            'data': cleaned_data,
            'warnings': warnings,
            'errors': errors,
        })
    return Response(result, 200)


@api_view(['POST'])
def product_feed_verify(request):
    data = json.loads(request.body.decode())
    if not isinstance(data, list):
        return Response({'message': 'list of objects required'}, 400)
    result = []
    for row in data:
        cleaned_data, errors, warnings = FeedParser.parse_feed(row)
        result.append({
            '_id': row.get('_id'),
            'data': cleaned_data,
            'errors': errors,
            'warnings': warnings,
        })
    return Response(result, 200)
