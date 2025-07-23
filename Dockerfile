# 1. IMAGEN BASE: Define la imagen base sobre la cual construirás tu aplicación.
#    "python:3.11-slim-buster" es una imagen oficial de Python basada en Debian,
#    optimizada para ser ligera ("slim") y segura. Usamos Python 3.11.
FROM python:3.11-slim-buster

# 2. DIRECTORIO DE TRABAJO: Establece el directorio de trabajo dentro del contenedor.
#    Todos los comandos subsiguientes se ejecutarán en este directorio.
WORKDIR /app

# 3. COPIAR REQUISITOS E INSTALAR DEPENDENCIAS:
#    Copia solo el archivo requirements.txt primero. Esto permite a Docker
#    cachear esta capa si los requisitos no cambian, acelerando futuras construcciones.
COPY requirements.txt .

#    Instala las dependencias listadas en requirements.txt.
#    --no-cache-dir: Evita que pip guarde paquetes en caché, reduciendo el tamaño final de la imagen.
RUN pip install --no-cache-dir -r requirements.txt

# 4. COPIAR EL CÓDIGO DE LA APLICACIÓN:
#    Copia el resto de los archivos de tu proyecto (incluyendo main.py, database.py, models.py, schemas.py)
#    al directorio de trabajo /app dentro del contenedor.
COPY . .

# 5. PUERTO DE LA APLICACIÓN:
#    Define el puerto en el que la aplicación FastAPI escuchará.
#    Aunque Cloud Run inyectará su propia variable de entorno $PORT, es buena práctica
#    tener un valor predeterminado o explicitarlo.
ENV PORT 8000

# 6. COMANDO DE EJECUCIÓN:
#    Define el comando que se ejecutará cuando el contenedor se inicie.
#    "uvicorn main:app": Inicia tu aplicación FastAPI.
#    "--host 0.0.0.0": Le dice a Uvicorn que escuche en todas las interfaces de red,
#                       lo cual es necesario para que el contenedor sea accesible.
#    "--port 8000": Le dice a Uvicorn que escuche en el puerto 8000. En Cloud Run,
#                   este puerto será mapeado al puerto asignado por $PORT.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
