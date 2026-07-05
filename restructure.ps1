$baseDir = "D:\CMU-SE 433\Group Project\foodiego_update\FoodieGo\apps"

function Create-LayeredFolders {
    param([string]$modulePath)
    if (!(Test-Path $modulePath)) { return }
    $folders = @("controllers", "services", "repositories", "entities", "routes", "dtos")
    foreach ($folder in $folders) {
        $path = Join-Path $modulePath $folder
        if (!(Test-Path $path)) {
            New-Item -ItemType Directory -Path $path | Out-Null
        }
    }
}

# Identity Service
$idModules = @("auth", "user", "role", "permission", "session")
foreach ($mod in $idModules) {
    Create-LayeredFolders "$baseDir\identity-service\src\modules\$mod"
}

# Restaurant Service
# Rename food to menu
if (Test-Path "$baseDir\restaurant-service\src\modules\menu\food.routes.js") {
    Rename-Item "$baseDir\restaurant-service\src\modules\menu\food.routes.js" "menu.routes.js"
}
if (Test-Path "$baseDir\restaurant-service\src\modules\menu\food.model.js") {
    Rename-Item "$baseDir\restaurant-service\src\modules\menu\food.model.js" "menu.repository.js"
}
$resModules = @("category", "menu", "restaurant", "review", "favorite")
foreach ($mod in $resModules) {
    Create-LayeredFolders "$baseDir\restaurant-service\src\modules\$mod"
}

# Order Service
$orderModules = @("cart", "checkout", "payment", "delivery")
foreach ($mod in $orderModules) {
    Create-LayeredFolders "$baseDir\order-service\src\modules\$mod"
}

Write-Output "Folder structure created successfully."
