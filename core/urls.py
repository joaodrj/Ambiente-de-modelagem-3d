from django.urls import path, include
from .views import *  # Ajuste o caminho de importação conforme necessário

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('sala/', SalaView.as_view(), name='sala'),
    path('ThreeJs/', ThreeJsView.as_view(), name='threejs'),
]