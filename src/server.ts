import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
//
import authRoutes from '@routes/auth.routes';
import productRoutes from '@routes/product.routes';
import exchangeRoutes from '@routes/exchange.routes';
import clientRoutes from '@routes/client.routes';
//
import { authMiddleware } from '@middleware/auth.middleware';


//
// Configurar dotenv
//
//
dotenv.config();
//
//
// Define __dirname para ESModules
//
//
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
//
// Crear la aplicación de Express
//
//
const app = express();
//
//
// Middlewares
//
//
app.use(express.json()); // Para que Express pueda parsear los cuerpos JSON
app.use(express.static(path.join(__dirname, '../../dist'))); // Servir archivos estáticos desde dist (si tienes front-end estático)
app.use(cors({
  origin: process.env.VITE_UI_URL,
  methods: ['GET','POST','OPTIONS','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));
//
//
// Rutas de autenticación
//
//
app.use('/api/auth', authRoutes);  
app.use('/api/product', authMiddleware, productRoutes);
app.use('/api/exchange', authMiddleware, exchangeRoutes);
app.use('/api/client', authMiddleware, clientRoutes);
//
//
// Manejo del puerto
//
//
const PORT = process.env.BACKEND_PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Backend corriendo en el puerto ${PORT}`);
}).on('error', (err) => {
  console.log(`⚠️ error, ${err}`);
  if (err.code === 'EADDRINUSE') {
    const newPort = Number(PORT) + 1;
    console.warn(`⚠️ Puerto ${PORT} ocupado, probando ${newPort}`);
    app.listen(newPort);
  }
});
