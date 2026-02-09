# Reglas de Seguridad de Firestore

Estas reglas deben aplicarse en la consola de Firebase para asegurar que:
1. Los usuarios solo puedan acceder a su propio documento
2. Los usuarios no puedan cambiar su rol
3. Solo admins puedan acceder a todos los documentos

## Reglas Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar si es admin
    function isAdmin(storeId) {
      return request.auth != null && 
             get(/databases/$(database)/documents/tiendas/$(storeId)/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Función helper para verificar si es el propio usuario
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    match /tiendas/{storeId} {
      // Permitir lectura de la tienda
      allow read: if true;
      
      // Colección de usuarios
      match /users/{userId} {
        // Lectura: solo el propio usuario o admin
        allow read: if isOwner(userId) || isAdmin(storeId);
        
        // Crear: cualquier usuario autenticado puede crear su propio perfil
        allow create: if isOwner(userId) && 
                        request.resource.data.role == 'user'; // Forzar rol 'user' al crear
        
        // Actualizar: solo el propio usuario, y no puede cambiar el rol
        allow update: if isOwner(userId) && 
                        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']));
        
        // Eliminar: solo admin
        allow delete: if isAdmin(storeId);
      }
      
      // Colección de pedidos
      match /orders/{orderId} {
        // Lectura: admin puede ver todos, usuario solo los suyos
        allow read: if isAdmin(storeId) || 
                      (request.auth != null && resource.data.userId == request.auth.uid);
        
        // Crear: cualquier usuario autenticado
        allow create: if request.auth != null;
        
        // Actualizar: solo admin
        allow update: if isAdmin(storeId);
        
        // Eliminar: solo admin
        allow delete: if isAdmin(storeId);
      }
      
      // Colección de inventario
      match /inventory/{itemId} {
        // Lectura: todos pueden ver el inventario
        allow read: if true;
        
        // Escritura: solo admin
        allow write: if isAdmin(storeId);
      }
      
      // Colección de configuración
      match /config/{configId} {
        allow read: if true;
        allow write: if isAdmin(storeId);
      }
    }
  }
}
```

## Cómo Aplicar

1. Ve a la consola de Firebase: https://console.firebase.google.com
2. Selecciona tu proyecto (petsstore-b0516)
3. Ve a Firestore Database > Rules
4. Copia y pega las reglas de arriba
5. Haz clic en "Publish"

## Notas Importantes

- Los usuarios siempre se crean con `role: 'user'`
- Solo desde el panel de admin (pets-admin) se puede cambiar el rol a 'admin'
- Los usuarios no pueden modificar su propio rol desde el cliente
- Los usuarios solo pueden ver y editar su propio documento de perfil
