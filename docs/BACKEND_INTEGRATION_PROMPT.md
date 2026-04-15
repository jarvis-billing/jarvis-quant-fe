# Backend Integration Prompt — MegaBloques Jarvis Quant

## Project Overview

Build a **Spring Boot 3** REST API backend for "Jarvis Quant", a production cost management system for a concrete block factory (bloquera). The frontend (Angular 18) is already built and expects the exact API contract described below.

All code (classes, methods, variables, endpoints) **must be in English**. Domain UI labels stay in Spanish on the frontend only.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Java 21 |
| Framework | Spring Boot 3.x |
| Database | MongoDB 7+ |
| Data Layer | Spring Data MongoDB |
| Build | Maven |
| Docs | Springdoc OpenAPI (Swagger UI) |
| Config | YAML profiles (`application-dev.yml`, `application-prod.yml`) |

> **Note:** The backend Maven project already exists. Add dependencies and code to the existing project.

---

## Database Configuration

Two separate MongoDB databases: one for development, one for production.

### Development (`application-dev.yml`)

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/megabloques_dev

server:
  port: 8080

logging:
  level:
    com.megabloques: DEBUG
```

### Production (`application-prod.yml`)

```yaml
spring:
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/megabloques_prod}

server:
  port: ${PORT:8080}

logging:
  level:
    com.megabloques: INFO
```

---

## Data Models (MongoDB Documents)

Use `@Document` annotations from Spring Data MongoDB. Use `String` for `id` fields (MongoDB ObjectId). Store `createdAt`/`updatedAt` with `@CreatedDate`/`@LastModifiedDate` (enable auditing with `@EnableMongoAuditing`).

### Supply (collection: `supplies`)

```java
@Document(collection = "supplies")
public class Supply {
    @Id
    private String id;
    private String name;           // required
    private String description;
    private String category;       // required
    private String purchaseUnit;   // required
    private String recipeUnit;     // required
    private double conversionFactor;
    private double unitCost;
    private double recipeCost;
    private double stock;          // default 0
    private boolean active;        // default true
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
}
```

### Product (collection: `products`)

Recipe items are **embedded** within the Product document. Each `RecipeItem` holds the full `supply` snapshot so the frontend gets all data in one response.

```java
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;           // required
    private String description;
    private String type;           // required
    private double heightCm;
    private double lengthCm;
    private double widthCm;
    private int unitsPerBatch;     // required
    private List<RecipeItem> recipe = new ArrayList<>();  // embedded
    private double productionCost; // default 0
    private double unitCost;       // default 0
    private int stock;             // default 0
    private boolean active;        // default true
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
}
```

### RecipeItem (embedded object, not a separate collection)

```java
public class RecipeItem {
    private Supply supply;   // full supply snapshot
    private double quantity;
    private double totalCost;
}
```

### Supplier (collection: `suppliers`)

Supplier / vendor data, referenced by Purchases.

```java
@Document(collection = "suppliers")
public class Supplier {
    @Id
    private String id;
    private String name;            // required
    private String documentType;    // "NIT", "CC", "CE", "Pasaporte"
    private String documentNumber;  // required
    private String contactName;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String notes;
    private boolean active;         // default true
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
}
```

### Client (collection: `clients`)

Basic person/company data, referenced by Sales.

```java
@Document(collection = "clients")
public class Client {
    @Id
    private String id;
    private String name;            // required
    private String documentType;    // "CC", "NIT", "CE", "TI", "Pasaporte"
    private String documentNumber;  // required
    private String phone;
    private String email;
    private String address;
    private String city;
    private String notes;
    private boolean active;         // default true
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
}
```

### Sale (collection: `sales`)

Sale items are **embedded** within the Sale document. The `clientId` references the `clients` collection and `clientName` is stored as a denormalized snapshot.

```java
@Document(collection = "sales")
public class Sale {
    @Id
    private String id;
    private Instant date;
    private String clientId;        // references clients
    private String clientName;      // denormalized
    private List<SaleItem> items = new ArrayList<>();  // embedded
    private double itemsSubtotal;   // default 0
    private double transportCost;   // default 0
    private double total;           // default 0
    private String notes;
    @CreatedDate
    private Instant createdAt;
}
```

### SaleItem (embedded object)

```java
public class SaleItem {
    private String itemType;   // "PRODUCT" or "SUPPLY"
    private String itemId;
    private String itemName;
    private String unit;
    private double quantity;
    private double unitPrice;
    private double subtotal;
}
```

### ProductionBatch (collection: `production_batches`)

```java
@Document(collection = "production_batches")
public class ProductionBatch {
    @Id
    private String id;
    private String productId;      // references products
    private String productName;
    private Instant date;
    private int cementBags;
    private int unitsProduced;
    private double kgPerBag;
    private double totalCementKg;
    private double productionCost;
    private double unitCost;
    private String qualityStatus;  // "PENDING", "APPROVED", "REJECTED"
    private String notes;
    @CreatedDate
    private Instant createdAt;
}
```

### Purchase (collection: `purchases`)

Purchase items are **embedded** within the Purchase document. The `supplierId` references the `suppliers` collection.

```java
@Document(collection = "purchases")
public class Purchase {
    @Id
    private String id;
    private Instant date;
    private String supplierId;      // references suppliers
    private String supplierName;    // denormalized
    private List<PurchaseItem> items = new ArrayList<>(); // embedded
    private double subtotal;        // default 0
    private double tax;             // default 0
    private double total;           // default 0
    private String notes;
    @CreatedDate
    private Instant createdAt;
}
```

### PurchaseItem (embedded object)

```java
public class PurchaseItem {
    private String itemType;   // "SUPPLY" or "PRODUCT"
    private String itemId;
    private String itemName;
    private String unit;
    private double quantity;
    private double unitPrice;
    private double subtotal;
}
```

**Important:** `RecipeItem`, `SaleItem`, and `PurchaseItem` are embedded subdocuments, not separate collections. `Client` and `Supplier` are separate collections referenced by ID in `Sale` and `Purchase` respectively; names are denormalized for display.

---

## REST API Endpoints

### Supplies — `/api/supplies`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET | `/api/supplies` | List all supplies | — | `Supply[]` |
| GET | `/api/supplies/{id}` | Get supply by ID | — | `Supply` |
| POST | `/api/supplies` | Create supply | `Supply` (no id) | `Supply` |
| PUT | `/api/supplies/{id}` | Update supply | `Supply` | `Supply` |
| DELETE | `/api/supplies/{id}` | Delete supply | — | `204` |
| PATCH | `/api/supplies/{id}/stock` | Update stock | `{ "quantity": number }` | `Supply` |

### Products — `/api/products`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET | `/api/products` | List all products (with recipe items + supply data) | — | `Product[]` |
| GET | `/api/products/{id}` | Get product by ID (with recipe) | — | `Product` |
| POST | `/api/products` | Create product | `Product` (no id, no recipe) | `Product` |
| PUT | `/api/products/{id}` | Update product | `Product` | `Product` |
| DELETE | `/api/products/{id}` | Delete product | — | `204` |
| PATCH | `/api/products/{id}/stock` | Update stock | `{ "quantity": number }` | `Product` |
| PUT | `/api/products/{id}/recipe` | Save/replace recipe | `RecipeItem[]` | `Product` |

**Important:** When returning a `Product`, include nested `recipe[]` with each item's `supply` object populated. The backend should recalculate `productionCost` and `unitCost` whenever the recipe is saved.

### Suppliers — `/api/suppliers`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET | `/api/suppliers` | List all suppliers | — | `Supplier[]` |
| GET | `/api/suppliers/{id}` | Get supplier by ID | — | `Supplier` |
| POST | `/api/suppliers` | Create supplier | `Supplier` (no id) | `Supplier` |
| PUT | `/api/suppliers/{id}` | Update supplier | `Supplier` | `Supplier` |
| DELETE | `/api/suppliers/{id}` | Delete supplier | — | `204` |

### Clients — `/api/clients`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET | `/api/clients` | List all clients | — | `Client[]` |
| GET | `/api/clients/{id}` | Get client by ID | — | `Client` |
| POST | `/api/clients` | Create client | `Client` (no id) | `Client` |
| PUT | `/api/clients/{id}` | Update client | `Client` | `Client` |
| DELETE | `/api/clients/{id}` | Delete client | — | `204` |

### Sales — `/api/sales`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET | `/api/sales` | List all sales (with items) | — | `Sale[]` |
| GET | `/api/sales/{id}` | Get sale by ID | — | `Sale` |
| POST | `/api/sales` | Create sale | `Sale` (with items, clientId, clientName) | `Sale` |
| DELETE | `/api/sales/{id}` | Delete sale | — | `204` |

**Important:** On POST the backend must:
1. Calculate `itemsSubtotal` (sum of item subtotals) and `total` (itemsSubtotal + transportCost).
2. **Deduct stock** for each item:
   - If `itemType == "PRODUCT"` → subtract `quantity` from the product's `stock`.
   - If `itemType == "SUPPLY"` → subtract `quantity` from the supply's `stock`.
3. On DELETE → **restore stock** for each item (reverse the deductions).

### Purchases — `/api/purchases`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET | `/api/purchases` | List all purchases (newest first) | — | `Purchase[]` |
| GET | `/api/purchases/{id}` | Get purchase by ID | — | `Purchase` |
| POST | `/api/purchases` | Create purchase | `Purchase` (with items) | `Purchase` |
| DELETE | `/api/purchases/{id}` | Delete purchase (reverts stock) | — | `204` |

**Important:** On POST the backend must:
1. Calculate `subtotal` (sum of item subtotals) and `total` (subtotal + tax).
2. **Add stock** for each item:
   - If `itemType == "SUPPLY"` → add `quantity` to the supply's `stock`.
   - If `itemType == "PRODUCT"` → add `quantity` to the product's `stock`.
3. On DELETE → **revert stock** for each item (subtract the quantities that were added).

### Production Batches — `/api/production-batches`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET | `/api/production-batches` | List all batches (newest first) | — | `ProductionBatch[]` |
| GET | `/api/production-batches?productId={id}` | Filter by product | — | `ProductionBatch[]` |
| POST | `/api/production-batches` | Register production | `RegisterProductionRequest` | `ProductionBatch` |
| PATCH | `/api/production-batches/{id}/quality` | Update quality status | `{ "status": "PENDING"\|"APPROVED"\|"REJECTED" }` | `ProductionBatch` |
| DELETE | `/api/production-batches/{id}` | Delete batch (reverts stock) | — | `204` |

**RegisterProductionRequest:**
```json
{
  "productId": 1,
  "productName": "Bloque Hueco 10",
  "cementBags": 2,
  "unitsPerBag": 60,
  "kgPerBag": 50,
  "productionCostPerBatch": 45000,
  "notes": ""
}
```

**Important:** On POST the backend must:
1. Calculate `unitsProduced = cementBags * unitsPerBag`
2. Calculate `totalCementKg = cementBags * kgPerBag`
3. Calculate `productionCost = cementBags * productionCostPerBatch`
4. Calculate `unitCost = productionCost / unitsProduced`
5. Add `unitsProduced` to the product's stock.
6. **Deduct supply stock** based on the product's recipe: for each `RecipeItem` in the product's recipe, subtract `recipeItem.quantity * cementBags` from the corresponding supply's `stock`. This represents the raw materials consumed per batch.

On DELETE the backend must:
1. Subtract `unitsProduced` from the product's stock.
2. **Restore supply stock**: re-add the quantities that were deducted in step 6 above.

---

## JSON Field Naming

MongoDB + Spring Data already uses **camelCase** field names by default. Ensure Jackson serializes dates properly:

```yaml
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false
    default-property-inclusion: non_null
```

**Important:** The frontend models use `id` as `number | undefined`. Since MongoDB uses String ObjectIds, the frontend models should remain using `id` but the backend will return `id` as a String. The Angular services already treat `id` generically so this is compatible — the frontend uses `id!` for comparisons only.

---

## CORS Configuration

Allow the Angular dev server in development:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:4200")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
```

---

## Project Structure

```
src/main/java/com/megabloques/jarvisquant/
├── JarvisQuantApplication.java
├── config/
│   ├── CorsConfig.java
│   └── MongoConfig.java          // @EnableMongoAuditing
├── document/
│   ├── Supply.java
│   ├── Product.java
│   ├── RecipeItem.java           // embedded POJO
│   ├── Client.java
│   ├── Sale.java
│   ├── SaleItem.java             // embedded POJO
│   └── ProductionBatch.java
├── repository/
│   ├── SupplyRepository.java     // extends MongoRepository<Supply, String>
│   ├── ProductRepository.java
│   ├── ClientRepository.java
│   ├── SaleRepository.java
│   └── ProductionBatchRepository.java
├── service/
│   ├── SupplyService.java
│   ├── ProductService.java
│   ├── ClientService.java
│   ├── SaleService.java
│   └── ProductionBatchService.java
├── controller/
│   ├── SupplyController.java
│   ├── ProductController.java
│   ├── ClientController.java
│   ├── SaleController.java
│   └── ProductionBatchController.java
├── dto/
│   ├── RegisterProductionRequest.java
│   ├── StockUpdateRequest.java
│   └── QualityUpdateRequest.java
└── exception/
    ├── ResourceNotFoundException.java
    └── GlobalExceptionHandler.java
```

---

## Seed Data

Create a `DataSeeder` component (`@Component` with `CommandLineRunner` or `ApplicationRunner`) that inserts seed data **only if the collections are empty**. This replaces SQL migrations.

```java
@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {
    // inject repositories, check if empty, insert seed data
}
```

**Supplies seed:**
| name | category | purchaseUnit | recipeUnit | conversionFactor | unitCost | recipeCost |
|------|----------|--------------|------------|------------------|----------|------------|
| Arena Amarilla | Arena | Metro cúbico | Lata | 24 | 12000 | 500 |
| Arena Gruesa | Arena | Metro cúbico | Lata | 24 | 14400 | 600 |
| Arena Fina | Arena | Metro cúbico | Lata | 24 | 13200 | 550 |
| Cemento | Cemento | Bolsa | Kilogramo | 42.5 | 35000 | 823.53 |
| Agua | Agua | Lata | Lata | 1 | 100 | 100 |
| Triturado | Triturado | Metro cúbico | Lata | 24 | 19200 | 800 |
| Mano de Obra Producción | Mano de Obra | Bolsa | Bolsa | 1 | 14000 | 14000 |
| Cargue | Servicio | Viaje | Viaje | 1 | 0 | 0 |
| Descargue | Servicio | Viaje | Viaje | 1 | 0 | 0 |

**Products seed:**
| name | type | heightCm | lengthCm | widthCm | unitsPerBatch |
|------|------|----------|----------|---------|---------------|
| Bloque Hueco 10 | Bloque hueco | 20 | 40 | 10 | 60 |
| Bloque Macizo 10 | Bloque macizo | 14 | 30 | 10 | 40 |

---

## Error Handling

Return standard error responses:

```json
{
  "timestamp": "2025-04-15T14:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Supply not found with id: 99",
  "path": "/api/supplies/99"
}
```

Use `@RestControllerAdvice` with `@ExceptionHandler` for:
- `ResourceNotFoundException` → 404
- `MethodArgumentNotValidException` → 400
- `Exception` → 500

---

## Validation

Use Jakarta Bean Validation (`@NotBlank`, `@NotNull`, `@Min`, etc.) on DTOs. For documents, validate in the service layer before saving.

---

## Testing

- Write integration tests for each controller using `@SpringBootTest` + `MockMvc`.
- Use `application-test.yml` with an embedded MongoDB (`de.flapdoodle.embed.mongo` or Testcontainers) for tests.

---

## Summary

The frontend is already configured to call `http://localhost:8080/api` in development and `/api` in production. All Angular services use `HttpClient` and expect the exact endpoint paths, request/response shapes, and camelCase JSON documented above. Build the backend to match this contract exactly.

## Maven Dependencies (add to existing `pom.xml`)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```
