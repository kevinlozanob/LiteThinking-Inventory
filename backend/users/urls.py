from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Endpoint para iniciar sesión (recibe email/password, retorna access/refresh tokens)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Endpoint para refrescar el token cuando caduca
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]