from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional, List

# Esquemas para Productos

class ProductoBase(BaseModel):
    nombre: str
    precio: Decimal
    descripcion: Optional[str] = None

class ProductoCreate(ProductoBase):
    pass # No hay campos adicionales para la creación, hereda de ProductoBase

class Producto(ProductoBase):
    id: int

    class Config:
        from_attributes = True # Permite que el modelo Pydantic se cree a partir de una instancia de SQLAlchemy

# Esquemas para Pedidos (opcionales para este requerimiento, pero útiles)

class PedidoBase(BaseModel):
    cliente: str
    total: Decimal

class PedidoCreate(PedidoBase):
    pass

class Pedido(PedidoBase):
    id: int
    fecha: datetime

    class Config:
        from_attributes = True

# Esquemas para Pedido_Productos (opcionales)

class PedidoProductoBase(BaseModel):
    cantidad: int

class PedidoProductoCreate(PedidoProductoBase):
    pedido_id: int
    producto_id: int

class PedidoProducto(PedidoProductoCreate):
    class Config:
        from_attributes = True

