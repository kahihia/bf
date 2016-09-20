def lists_of_dicts_equalled(left, right):
    return {frozenset(i.items()) for i in left} == {frozenset(i.items()) for i in right}
