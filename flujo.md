# Flujo del sistema LogiRaf

## Arquitectura general

El backend es una aplicación Django con Django REST Framework. Se usa SQLite como base de datos y JWT para autenticación.

Apps principales:
- `usuarios`: gestión de usuarios y roles.
- `inventario`: gestión de productos, categorías, sectores, stock y movimientos.
- `compras`: creación y registro de compras, comprobantes y detalle de compra.
- `ventas`: registro de ventas, comprobantes y detalle de venta.
- `reportes`: app creada pero sin definición de endpoints ni modelos activos.

## Configuración general

- `config/settings.py` define:
- `config/urls.py` expone las rutas principales:
  - `api/auth/login/`
  - `api/auth/refresh/`
  - `api/usuarios/`
  - `api/inventario/`
  - `api/ventas/`
  - `api/compras/`

## Flujo de autenticación y usuarios

### Modelos
- `Rol`: define el rol del usuario con opciones como `OPERADOR_DEPOSITO`, `ENCARGADO_CAJA`, `RESPONSABLE_ABASTECIMIENTO`, `ADMINISTRADOR_SISTEMA`.
- `Usuario`: extiende `AbstractUser` e incluye `nombre_completo` y `rol` como `ForeignKey` a `Rol`.
- `UsuarioManager.create_superuser` asigna `ADMINISTRADOR_SISTEMA` si no se proporciona rol.

### Serializadores y vistas
- Endpoint `me/`: devuelve datos del usuario autenticado.

### Servicios
- `UsuarioService.crear_usuario(data)`:
  - valida `username` y `password`.
  - comprueba que el nombre de usuario no exista.
  - crea el usuario, asigna contraseña con `set_password` y guarda el objeto.

## Permisos personalizados
- `EsAdmin`: permite sólo a `request.user.is_staff`.
- `TieneRol`: base que comprueba `request.user.rol.nombre_rol` y permite a staff.
- Subclases: `EsOperadorDeposito`, `EsEncargadoDeposito`, `EsVendedor`, `EsRepositor`, `EsEncargadoSalon`, `EsResponsableAbastecimiento`.
- `PuedeIngresarMercaderia`: autoriza a operadores o encargados de depósito.
- `PuedeAprobarMovimientos`: autoriza sólo a encargado de depósito.
- `PuedeRegistrarVenta`: autoriza sólo a encargado de caja o repositor.

## Inventario y stock

### Modelos
- `Categoria`: categoría de producto.
- `Producto`: producto con nombre, marca, talle, descripción, precio unitario y categoría.
- `Sector`: sectores físicos `DEPOSITO` o `SALON`.
- `StockPorSector`: cantidad de producto en un sector.
- `StockMovimiento`: registra movimientos de stock de tipo `entrada`, `salida`, o `transferencia`.

### Validez de movimientos
- `StockMovimiento.clean` obliga:
  - `entrada` requiere `sector_destino`.
  - `salida` requiere `sector_origen`.
  - `transferencia` requiere ambos sectores.
- `save()` llama a `clean()` antes de guardar.

### Serializadores
- `ProductoSerializer`: permite crear producto referenciando categoría con `id_categoria`.
- `StockPorSectorSerializer`: permite asociar producto y sector por ID.
- `StockMovimientoSerializer`: crea movimiento y llama a `StockService.procesar_movimiento`.

### Servicio de stock
- `StockService.procesar_movimiento(movimiento)`:
  - `entrada` aumenta stock en `sector_destino`.
  - `salida` disminuye stock en `sector_origen`; valida cantidad suficiente.
  - `transferencia` mueve cantidad entre origen y destino; valida stock del origen.

### Endpoints
- `api/inventario/categorias/`
- `api/inventario/productos/`
- `api/inventario/sectores/`
- `api/inventario/stockporsector/`
- `api/inventario/stockmovimiento/`

## Compras

### Modelos
- `Compra`: fecha y total de compra; `responsable_abastecimiento` es un usuario con rol `RESPONSABLE_ABASTECIMIENTO`.
- `DetalleCompra`: cada línea de compra con producto, cantidad y precio unitario.
- `ComprobanteCompra`: comprobante único asociado a una compra.

### Lógica de servicio
- `CompraService.crear_compra(data, detalles_data)` ejecuta todo en transacción:
  1. crea la `Compra`.
  2. crea el `ComprobanteCompra` con número generado `CMP-XXXXXX`.
  3. obtiene el sector `DEPOSITO`.
  4. por cada detalle crea `DetalleCompra` y registra `StockMovimiento` tipo `entrada` al depósito.

### Endpoints
- `api/compras/compras/`

### Permisos
- `CompraViewSet` usa `EsResponsableAbastecimiento`.

## Ventas

### Modelos
- `Comprobante`: comprobante de venta único.
- `Venta`: fecha, comprobante, vendedor con rol `ENCARGADO_CAJA` o `ENCARGADO_SALON`.
- `DetalleVenta`: producto, cantidad y precio unitario de venta.

### Lógica de servicio
- `VentaService.crear_venta(data, items_data)`:
  1. valida que haya vendedor.
  2. crea comprobante `TKT-XXXXXX`.
  3. crea venta.
  4. obtiene sector `SALON`.
  5. por cada item crea detalle de venta y registra `StockMovimiento` tipo `salida` desde el sector salón.

### Endpoints
- `api/ventas/ventas/`
- `api/ventas/detalles/`
- `api/ventas/comprobantes/`

### Permisos
- `VentaViewSet` permite lectura pública; para escritura requiere `EsVendedor`.

## Observaciones importantes

- La app `reportes` no tiene rutas ni modelos operativos.
- El backend usa `SQLite` y se recomienda migrar a un motor de producción cuando escale.
- Los permisos personalizados dependen de `request.user.rol.nombre_rol`; si el usuario no tiene rol o está anónimo, las comprobaciones fallarán.
- El movimiento de stock en compras agrega stock al depósito, mientras que las ventas descuentan stock del salón.

## Flujo de uso típico

1. crear roles y usuarios en el admin o con endpoints.
2. ingresar productos y sectores.
3. registrar compras desde el responsable de abastecimiento; esto crea stock en `DEPOSITO`.
4. mover o registrar productos en `SALON` mediante `StockMovimiento` o procesos adicionales.
5. registrar ventas; el sistema genera comprobantes y descuenta stock del `SALON`.

## Estructura de rutas

- `api/auth/login/`: obtiene tokens JWT.
- `api/auth/refresh/`: renueva tokens.
- `api/usuarios/usuarios/`: CRUD de usuarios.
- `api/usuarios/roles/`: CRUD de roles.
- `api/usuarios/me/`: datos del usuario autenticado.
- `api/inventario/*`: gestión completa de inventario.
- `api/compras/compras/`: gestión de compras.
- `api/ventas/ventas/`: gestión de ventas.

---

Este archivo describe el funcionamiento completo del backend Django y las relaciones entre usuarios, inventario, compras y ventas.