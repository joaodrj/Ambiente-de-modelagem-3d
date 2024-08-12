from .models import *
from django.views import View
from django.views.generic import TemplateView

class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

class SalaView(TemplateView):
    template_name = 'sala.html'

class DebugUiView(TemplateView):
    template_name = 'DebugUi.html'

class ModelosView(TemplateView):
    template_name = 'modelos.html'

class AreaVirtualView(TemplateView):
    template_name = 'areavirtual.html'