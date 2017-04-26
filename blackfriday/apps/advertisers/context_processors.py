from .models import Merchant, ModerationStatus

def moderation(request):
	return {
		'moderation_count': Merchant.objects.filter(moderation_status=ModerationStatus.waiting).count()
	}
