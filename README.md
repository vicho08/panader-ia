# 🥐 Panader-IA 🚀

Este repositorio contiene la implementación de una aplicación web de panadería, compuesta por un backend (FastAPI) y un frontend (React), ambos desplegados en Google Cloud Run. La aplicación se conecta a una base de datos PostgreSQL en Cloud SQL y utiliza Secret Manager para la gestión segura de credenciales.

---

## 🔗 Repositorio Público

Puedes encontrar el código fuente en:
[https://github.com/vicho08/panader-ia.git](https://github.com/vicho08/panader-ia.git)

---

## 🛠️ Configuración y Despliegue en Google Cloud Platform

A continuación se detallan los comandos clave para configurar y desplegar la aplicación en Google Cloud Run y Cloud SQL.

**⚠️ Importante:**
* Reemplaza `{ID_PROJECT_GCLOUD}` con tu **ID de Proyecto de GCP**.
* Asegúrate de que la región (`us-central1`) coincida con la región donde deseas desplegar tus servicios.
* Las URLs de los servicios de Cloud Run (`https://panaderia-backend-xxxxxxxx-xx.a.run.app`, `https://panaderia-frontend-xxxxxxxx-xx.a.run.app`) se generan al momento del despliegue y deben ser actualizadas en la configuración correspondiente (variables de entorno, CORS).
* Se asume que Docker está instalado localmente para la construcción de imágenes del frontend.

### 1. Configuración de la Base de Datos Cloud SQL (PostgreSQL)

Asegúrate de tener una instancia de Cloud SQL (PostgreSQL) creada y con un usuario (`postgres`) y contraseña configurados.

### 2. Configuración de Secret Manager (Contraseña de DB)

Almacena la contraseña de tu base de datos de Cloud SQL en Secret Manager para una gestión segura.

```bash
# Ejemplo: Crea un secreto llamado DB_PASSWORD_SECRET con tu contraseña
# gcloud secrets create DB_PASSWORD_SECRET --data-file=-
# Enter your_db_password_here
````

### 3\. Permisos IAM para la Cuenta de Servicio del Backend

La cuenta de servicio de Cloud Run para el backend necesita permisos para acceder a Cloud SQL y a Secret Manager.

```bash
# Otorgar rol de Cliente de Cloud SQL
gcloud projects add-iam-policy-binding {ID_PROJECT_GCLOUD} \
  --member "serviceAccount:panaderia-backend-sa@{ID_PROJECT_GCLOUD}.iam.gserviceaccount.com" \
  --role "roles/cloudsql.client"

# Otorgar rol de Accesor de Secreto (para Secret Manager)
gcloud secrets add-iam-policy-binding DB_PASSWORD_SECRET \
  --member "serviceAccount:panaderia-backend-sa@{ID_PROJECT_GCLOUD}.iam.gserviceaccount.com" \
  --role "roles/secretmanager.secretAccessor"
```

### 4\. Despliegue del Backend (FastAPI)

#### **Construcción de la Imagen del Backend**

```bash
# Desde el directorio raíz del proyecto de tu Backend (donde está el Dockerfile)
gcloud builds submit --tag gcr.io/{ID_PROJECT_GCLOUD}/panaderia-api:latest .
```

#### **Despliegue del Servicio de Backend en Cloud Run**

```bash
gcloud run deploy panaderia-backend \
  --image gcr.io/{ID_PROJECT_GCLOUD}/panaderia-api:latest \
  --platform managed \
  --region us-central1 \
  --service-account panaderia-backend-sa@{ID_PROJECT_GCLOUD}.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --add-cloudsql-instances {ID_PROJECT_GCLOUD}:us-central1:panaderia-2025-07-22 \
  --set-env-vars \
DB_USER=postgres,\
DB_NAME=panaderia,\
DB_PORT=5432 \
  --set-secrets \
DB_PASSWORD=DB_PASSWORD_SECRET:latest \
  --port 8080
```

**Nota:** El comando anterior es para usar el Cloud SQL Proxy. Si no usas el proxy y te conectas directamente por IP pública, asegúrate de que Cloud SQL tenga autorizadas las IPs salientes de Cloud Run y cambia `DB_HOST` a la IP pública de tu instancia de Cloud SQL. Si esto fue un intento de despliegue anterior, omítelo si ya no es relevante.

### 5\. Despliegue del Frontend (React)

#### **Preparación del Dockerfile del Frontend (`Dockerfile.frontend`)**

Asegúrate de que tu `Dockerfile.frontend` incluya los `ARG` y `ENV` para pasar la URL del backend durante la construcción:

```dockerfile
# ... (otras líneas del Dockerfile) ...
ARG REACT_APP_BACKEND_API_URL
ENV REACT_APP_BACKEND_API_URL=$REACT_APP_BACKEND_API_URL
# ... (resto del Dockerfile) ...
```

#### **Construcción de la Imagen del Frontend Localmente (Recomendado)**

```bash
# Desde el directorio raíz de tu proyecto de Frontend (donde está Dockerfile.frontend)
docker build \
  -t gcr.io/{ID_PROJECT_GCLOUD}/panaderia-frontend:latest \
  -f Dockerfile.frontend \
  --build-arg REACT_APP_BACKEND_API_URL='[https://panaderia-backend-xxxxxxxx-xx.a.run.app](https://panaderia-backend-xxxxxxxx-xx.a.run.app)' \ # Actualiza con la URL real de tu backend
  .
```

**Nota:** Sustituye `https://panaderia-backend-xxxxxxxx-xx.a.run.app` por la URL real de tu servicio de backend una vez desplegado.

#### **Subir la Imagen del Frontend a Artifact Registry**

```bash
# Después de construir la imagen localmente
docker push gcr.io/{ID_PROJECT_GCLOUD}/panaderia-frontend:latest
```

#### **Despliegue del Servicio de Frontend en Cloud Run**

```bash
gcloud run deploy panaderia-frontend \
  --image gcr.io/{ID_PROJECT_GCLOUD}/panaderia-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars REACT_APP_BACKEND_API_URL='[https://panaderia-backend-586791903884.us-central1.run.app](https://panaderia-backend-586791903884.us-central1.run.app)' # Opcional si ya se "horneó" en el build-arg
```

**Nota:** Asegúrate de que `https://panaderia-backend-586791903884.us-central1.run.app` sea la URL de tu backend.

### 6\. Actualización de CORS

Recuerda que, una vez desplegados ambos servicios y con sus URLs finales (ya sean las predeterminadas de Cloud Run o dominios personalizados), debes actualizar la configuración CORS en tu backend (en `main.py`) para permitir las peticiones desde la URL de tu frontend. Luego, deberás redesplegar el backend.

```python
# En main.py de tu backend
origins = [
    # ... tus otras URLs de desarrollo (localhost) ...
    "[https://panaderia-backend-URL-REAL.run.app](https://panaderia-backend-URL-REAL.run.app)", # URL real de tu propio backend
    "[https://panaderia-frontend-URL-REAL.run.app](https://panaderia-frontend-URL-REAL.run.app)", # URL real de tu frontend
    # Si usas dominios personalizados:
    # "[https://api.tudominio.com](https://api.tudominio.com)",
    # "[https://app.tudominio.com](https://app.tudominio.com)",
]
```

### 7\. Verificación de la Aplicación

Una vez desplegados ambos servicios, visita la URL de tu frontend (ya sea la de Cloud Run o tu dominio personalizado) para interactuar con la aplicación. Si todo está correcto, deberías ver la aplicación de panadería funcionando y consumiendo datos de tu backend.

-----

## 💡 Próximos Pasos / Mejoras

  * **Dominios Personalizados:** Configura dominios personalizados para tener URLs más amigables (ej. `api.tudominio.com`, `app.tudominio.com`). Consulta la documentación de Google Cloud Run para `gcloud run domains add-mapping`.
  * **Gestión de Versiones:** Utiliza etiquetas de Docker más allá de `:latest` (ej. `:v1.0.0`) para mejor control de versiones.
  * **CI/CD:** Implementa un pipeline de Integración Continua/Despliegue Continuo (CI/CD) usando Cloud Build para automatizar la construcción y el despliegue.
  * **Logging y Monitoreo:** Explora Cloud Logging y Cloud Monitoring para depurar y observar el rendimiento de tus servicios.

-----

## 📚 Prompts de Referencia de Gemini

Puedes revisar la conversación completa con Gemini que ayudó a la creación de este proyecto y sus comandos aquí:
[https://g.co/gemini/share/453091a25926](https://g.co/gemini/share/453091a25926)

```
