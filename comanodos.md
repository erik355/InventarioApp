migration : dotnet ef database update --project src/InventarioApp.Infrastructure --startup-project src/InventarioApp.API
actualizar migration : dotnet ef migrations add ActualizacionEntidades --project src/InventarioApp.Infrastructure --startup-project src/InventarioApp.API
guardar cambios : dotnet ef database update --project src/InventarioApp.Infrastructure --startup-project src/InventarioApp.API
run : dotnet run --project src/InventarioApp.API
run react :cd E:\InventarioApp\inventario-app-client
           npm run dev
remover inventariodb :  Remove-Item E:\InventarioApp\src\InventarioApp.API\inventario.db



git add .
git commit -m "Actualizacion entidades y migraciones"
git push origin master