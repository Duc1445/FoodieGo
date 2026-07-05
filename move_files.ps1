$baseDir = "D:\CMU-SE 433\Group Project\foodiego_update\FoodieGo\apps"

function Move-To-Layer {
    param([string]$source, [string]$dest)
    if (Test-Path $source) {
        Move-Item $source $dest -Force
    }
}

# Identity Service
Move-To-Layer "$baseDir\identity-service\src\modules\auth\auth.routes.js" "$baseDir\identity-service\src\modules\auth\routes\"
Move-To-Layer "$baseDir\identity-service\src\modules\auth\auth.service.js" "$baseDir\identity-service\src\modules\auth\services\"
Move-To-Layer "$baseDir\identity-service\src\modules\user\user.model.js" "$baseDir\identity-service\src\modules\user\repositories\user.repository.js"

# Restaurant Service (formerly food)
Move-To-Layer "$baseDir\restaurant-service\src\modules\category\category.routes.js" "$baseDir\restaurant-service\src\modules\category\routes\"
Move-To-Layer "$baseDir\restaurant-service\src\modules\category\category.model.js" "$baseDir\restaurant-service\src\modules\category\repositories\category.repository.js"

Move-To-Layer "$baseDir\restaurant-service\src\modules\menu\menu.routes.js" "$baseDir\restaurant-service\src\modules\menu\routes\"
Move-To-Layer "$baseDir\restaurant-service\src\modules\menu\menu.repository.js" "$baseDir\restaurant-service\src\modules\menu\repositories\"

# Order Service
Move-To-Layer "$baseDir\order-service\src\modules\cart\cart.routes.js" "$baseDir\order-service\src\modules\cart\routes\"
Move-To-Layer "$baseDir\order-service\src\modules\cart\cart.model.js" "$baseDir\order-service\src\modules\cart\repositories\cart.repository.js"

Move-To-Layer "$baseDir\order-service\src\modules\checkout\order.routes.js" "$baseDir\order-service\src\modules\checkout\routes\checkout.routes.js"
Move-To-Layer "$baseDir\order-service\src\modules\checkout\order.model.js" "$baseDir\order-service\src\modules\checkout\repositories\checkout.repository.js"

Move-To-Layer "$baseDir\order-service\src\modules\delivery\delivery.routes.js" "$baseDir\order-service\src\modules\delivery\routes\"
Move-To-Layer "$baseDir\order-service\src\modules\delivery\delivery.model.js" "$baseDir\order-service\src\modules\delivery\repositories\delivery.repository.js"

Write-Output "Files moved to DDD layers."
