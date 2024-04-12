from django.urls import path, include
from .views import *  # Ajuste o caminho de importação conforme necessário

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('sala/', SalaView.as_view(), name='sala'),
    path('modelos/', ModelosView.as_view(), name='modelos'),
    path('debugui/', DebugUiView.as_view(), name='debugui')
]