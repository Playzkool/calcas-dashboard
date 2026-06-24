from django.http import HttpResponse


def rate_limited(request, exception):
    return HttpResponse(
        "Trop de requêtes. Veuillez réessayer dans quelques instants.",
        status=429,
        content_type="text/plain; charset=utf-8",
    )
