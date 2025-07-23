from sqlalchemy import Column, Integer, String, DECIMAL, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    precio = Column(DECIMAL(10, 2), nullable=False)
    descripcion = Column(Text)

    pedidos_productos = relationship("PedidoProducto", back_populates="producto")

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    cliente = Column(String(255), nullable=False)
    total = Column(DECIMAL(10, 2), nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())

    productos_pedido = relationship("PedidoProducto", back_populates="pedido")

class PedidoProducto(Base):
    __tablename__ = "pedido_productos"

    pedido_id = Column(Integer, ForeignKey("pedidos.id", ondelete="CASCADE"), primary_key=True)
    producto_id = Column(Integer, ForeignKey("productos.id", ondelete="CASCADE"), primary_key=True)
    cantidad = Column(Integer, nullable=False)

    pedido = relationship("Pedido", back_populates="productos_pedido")
    producto = relationship("Producto", back_populates="pedidos_productos")
