# Torneo de Videojuegos ESPE Santo Domingo

## Descripcion
Plataforma web integral para gestionar un torneo de eSports universitario. Portal publico, dashboard de participantes, panel administrativo, modulo de tesoreria, sistema de brackets y overlay de transmision para OBS Studio.

## Stack Tecnologico
- Frontend: React 18 + Vite
- Estilos: Tailwind CSS v4
- Backend/BaaS: Firebase (Auth, Firestore, Realtime Database)
- Validacion: Zod
- Iconografia: lucide-react
- Testing: Vitest + React Testing Library
- Routing: react-router-dom v7
- Despliegue: Vercel

## Requisitos Previos
- Node.js 18+
- npm 9+
- Cuenta de Firebase
- Cuenta de Vercel (para despliegue)

## Instalacion
```bash
git clone <repo-url>
cd espe-tournament
npm install
cp .env.example .env
# Editar .env con las credenciales reales de Firebase
npm run dev
```

## Variables de Entorno
Copiar .env.example a .env y completar:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_DATABASE_URL

## Comandos Disponibles
| Comando | Descripcion |
|---|---|
| npm run dev | Servidor de desarrollo |
| npm run build | Build de produccion |
| npm run preview | Preview del build |
| npm run test | Ejecutar tests |
| npm run lint | Ejecutar linter |

## Configuracion de Firebase
1. Crear proyecto en Firebase Console
2. Habilitar Authentication con Email/Password
3. Crear base de datos Firestore en modo produccion
4. Habilitar Realtime Database
5. Copiar credenciales del SDK web a .env
6. Desplegar Security Rules:
```bash
npx -y firebase-tools@latest deploy --only firestore:rules
npx -y firebase-tools@latest deploy --only database
```

## Configuracion de Custom Claims (Admin)
El rol de administrador se asigna via Firebase Admin SDK. Este proceso NUNCA debe ejecutarse desde el cliente.

1. Generar service account key desde Firebase Console > Project Settings > Service Accounts
2. Establecer variable de entorno:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/al/serviceAccountKey.json"
```
3. Ejecutar el script:
```bash
node scripts/setAdminClaim.cjs admin@correo.com
```
4. El usuario debe cerrar sesion y volver a iniciar para que el claim tome efecto.

## Despliegue en Vercel
1. Crear cuenta en vercel.com
2. Importar repositorio desde GitHub
3. Configurar:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
4. Agregar variables de entorno (las mismas de .env)
5. Desplegar

## Configuracion de Dominio Personalizado (Name.com)
1. En Vercel > Settings > Domains, agregar el dominio
2. En Name.com > DNS Records:
   - Tipo A: @ -> 76.76.21.21
   - Tipo CNAME: www -> cname.vercel-dns.com
3. Esperar propagacion DNS (hasta 48 horas)
4. Verificar HTTPS automatico en Vercel

## Seguridad
- Firebase Security Rules validan cada operacion en servidor
- Custom claims para rol admin
- Zod valida datos antes de enviar a Firebase
- Sanitizacion de inputs de usuario
- No se usa dangerouslySetInnerHTML
- No se exponen credenciales en codigo

## Seed Data
La aplicacion incluye datos seed para desarrollo. Para usar con Firebase real, crear las colecciones de disciplinas en Firestore con los documentos correspondientes.

## Disciplinas del Torneo
1. Clash Royale (1v1)
2. Fortnite (1v1)
3. Minecraft (1v1)
4. League of Legends (5v5 / 1v1)
5. Dragon Ball Sparking Zero (1v1)
6. FIFA 26 (1v1)
7. Mortal Kombat (1v1)

## Costo de Inscripcion
$2.00 por disciplina

## Licencia
Proyecto universitario - ESPE Santo Domingo
# TeamESPEWeb
